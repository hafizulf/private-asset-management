import { injectable } from "inversify";
import { IDashboardTotalRepository } from "./dashboard-total-repository-interface";
import { DashboardTotal as DashboardTotalPersistence } from "@/modules/common/sequelize";
import { DashboardTotalDomain, IDashboardTotal } from "./dashboard-total-domain";
import { DashboardMetric, RecentTransactionDbRow, TopCommodityRow } from "./dashboard-total.dto";
import { sequelize } from "@/config/database";
import { QueryTypes } from "sequelize";

@injectable()
export class DashboardTotalRepository implements IDashboardTotalRepository {
  async findAll(): Promise<DashboardTotalDomain[]> {
    const data = await DashboardTotalPersistence.findAll();
    return data.map((el) => DashboardTotalDomain.create(el.toJSON()));
  }

  async createOrUpdate(props: IDashboardTotal): Promise<void> {
    const isExist = await DashboardTotalPersistence.findOne({ where: { name: props.name } });
    if(isExist) {
      await DashboardTotalPersistence.update(props, { where: { name: props.name } });
    } else {
      await DashboardTotalPersistence.create(props);
    }
  }

  async findTopCommodities(
    from: string | undefined,
    to: string | undefined,
    metric: DashboardMetric,
    limit = 5
  ): Promise<TopCommodityRow[]> {
    const whereDate =
      from && to
        ? `
          AND t."date" >= :from
          AND t."date" <= :to
        `
        : '';

    const orderBy = metric === 'qty' ? `"totalQty" DESC` : `"totalValue" DESC`;

    const replacements: Record<string, any> = { limit };
    if (from && to) {
      replacements.from = from;
      replacements.to = to;
    }

    const rows = await sequelize.query<TopCommodityRow>(
      `
      WITH tx AS (
        SELECT
          bh."commodity_id" AS "commodityId",
          bh."date"::date AS "date",
          bh."qty" AS "qty",
          bh."total_price" AS "value",
          'buy' AS "kind"
        FROM "buy_histories" bh
        WHERE bh."deleted_at" IS NULL

        UNION ALL

        SELECT
          sh."commodity_id" AS "commodityId",
          sh."date"::date AS "date",
          sh."qty" AS "qty",
          sh."total_price" AS "value",
          'sell' AS "kind"
        FROM "sell_histories" sh
        WHERE sh."deleted_at" IS NULL
      ),
      filtered AS (
        SELECT *
        FROM tx t
        WHERE 1=1
          ${whereDate}
      ),
      agg AS (
        SELECT
          f."commodityId" AS "commodityId",
          COALESCE(SUM(CASE WHEN f."kind" = 'buy' THEN f."qty" END), 0) AS "buyQty",
          COALESCE(SUM(CASE WHEN f."kind" = 'buy' THEN f."value" END), 0) AS "buyValue",
          COALESCE(SUM(CASE WHEN f."kind" = 'sell' THEN f."qty" END), 0) AS "sellQty",
          COALESCE(SUM(CASE WHEN f."kind" = 'sell' THEN f."value" END), 0) AS "sellValue",
          COALESCE(SUM(f."qty"), 0) AS "totalQty",
          COALESCE(SUM(f."value"), 0) AS "totalValue"
        FROM filtered f
        GROUP BY f."commodityId"
      )
      SELECT
        a."commodityId" AS "commodityId",
        c."name" AS "commodityName",
        a."buyQty"::text AS "buyQty",
        a."buyValue"::text AS "buyValue",
        a."sellQty"::text AS "sellQty",
        a."sellValue"::text AS "sellValue",
        a."totalQty"::text AS "totalQty",
        a."totalValue"::text AS "totalValue"
      FROM agg a
      JOIN "commodities" c ON c."id" = a."commodityId"
      ORDER BY ${orderBy}
      LIMIT :limit
      `,
      {
        replacements,
        type: QueryTypes.SELECT,
      }
    );

    return rows;
  }

  async getRecentTransactions(limit = 10): Promise<RecentTransactionDbRow[]> {
    const rows = await sequelize.query<RecentTransactionDbRow>(
      `
      SELECT
        bh.date        AS "date",
        c.name         AS "commodity",
        'BUY'          AS "type",
        bh.qty         AS "qty",
        bh.total_price AS "total",
        bh.created_at  AS "createdAt"
      FROM buy_histories bh
      JOIN commodities c ON c.id = bh.commodity_id

      UNION ALL

      SELECT
        sh.date        AS "date",
        c.name         AS "commodity",
        'SELL'         AS "type",
        sh.qty         AS "qty",
        sh.total_price AS "total",
        sh.created_at  AS "createdAt"
      FROM sell_histories sh
      JOIN commodities c ON c.id = sh.commodity_id

      ORDER BY "createdAt" DESC
      LIMIT :limit;
      `,
      {
        type: QueryTypes.SELECT,
        replacements: { limit },
      }
    );

    return rows;
  }
}
