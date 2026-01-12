import { injectable } from "inversify";
import { IBuyHistoryRepository } from "./buy-history-repository-interface";
import { TStandardPaginateOption } from "../common/dto/pagination-dto";
import { Pagination } from "../common/pagination";
import { BuyHistoryDomain, IBuyHistory } from "./buy-history-domain";
import { AppError, HttpCode } from "@/exceptions/app-error";
import { BuyHistoryErrMessage } from "@/exceptions/error-message-constants";
import { 
  BuyHistory as BuyHistoryPersistence,
  Commodity as CommodityPersistence,
} from "@/modules/common/sequelize";
import { Op, QueryTypes, Sequelize } from "sequelize";
import { BaseQueryOption } from "../common/dto/common-dto";
import { 
  DashboardFilter, 
  DashboardGranularity, 
  DashboardMetric, 
  DateFormat, 
  DateRange, 
  ENUM_FILTER_DASHBOARD, 
  TimeUnit
} from "../dashboard-totals/dashboard-total.dto";
import dayjs from 'dayjs';
import { sequelize } from "@/config/database";
import Decimal from "decimal.js";
import { toDecimal } from "@/helpers/math.helper";

@injectable()
export class BuyHistoryRepository implements IBuyHistoryRepository {
  findAll = async (): Promise<BuyHistoryDomain[]> => {
    const data = await BuyHistoryPersistence.findAll({
      include: [
        {
          model: CommodityPersistence, 
          attributes: ["name", "unit"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });
    return data.map((el) => BuyHistoryDomain.create(el.toJSON()));
  }

  findAllWithPagination = async (
    paginateOption: TStandardPaginateOption, 
    pagination: Pagination
  ): Promise<[BuyHistoryDomain[], Pagination]> => {
    const search = paginateOption.search;
    const orderBy = paginateOption.orderBy ? paginateOption.orderBy : "commodityName";
    const sort = paginateOption.sort ? paginateOption.sort : "DESC";
    const searchCondition = search
      ? {
          [Op.or]: [
            Sequelize.literal(`"commodity"."name" ILIKE :search`),
          ],
        }
      : {};

    const { rows, count } = await BuyHistoryPersistence.findAndCountAll({
      include: [
        {
          model: CommodityPersistence, 
          attributes: ["name", "unit"],
        },
      ],
      where: {
        ...searchCondition,
      },
      replacements: { search: `%${search}%` },
      order: [
        orderBy === "commodityName"
          ? [Sequelize.col("commodity.name"), sort] 
          : [Sequelize.col(orderBy), sort],
      ],
      limit: pagination.limit,
      offset: pagination.offset,
    });

    pagination.generateMeta(count, rows.length);
    return [rows.map((el) => BuyHistoryDomain.create(el.toJSON())), pagination];
  }

  store = async (props: IBuyHistory, option?: BaseQueryOption): Promise<BuyHistoryDomain> => {
    const createdBuyHistory = await BuyHistoryPersistence.create(props, { transaction: option?.transaction });
    return BuyHistoryDomain.create(createdBuyHistory.toJSON());
  }

  findById = async (id: string): Promise<BuyHistoryDomain> => {
    const data = await BuyHistoryPersistence.findByPk(id, {
      attributes: {
        include: [
          [
            Sequelize.literal(`ROUND(("total_price" / "qty")::numeric, 2)`),
            "unitPrice",
          ],
        ],
      },
      include: [
        {
          model: CommodityPersistence, 
          attributes: ["name", "unit"],
        },
      ],
    });
    if(!data) {
      throw new AppError({
        statusCode: HttpCode.NOT_FOUND,
        description: BuyHistoryErrMessage.NOT_FOUND,
      })
    }
    return BuyHistoryDomain.create(data.toJSON());
  }

  update = async (
    id: string, 
    props: Partial<IBuyHistory>,
    option?: BaseQueryOption,
  ): Promise<BuyHistoryDomain> => {
    const data = await BuyHistoryPersistence.findByPk(id);
    if(!data) {
      throw new AppError({
        statusCode: HttpCode.NOT_FOUND,
        description: BuyHistoryErrMessage.NOT_FOUND,
      })
    }
    const updatedBuyHistory = await data.update(props, { transaction: option?.transaction });
    return BuyHistoryDomain.create(updatedBuyHistory.toJSON());
  }

  delete = async (id: string, option?: BaseQueryOption): Promise<boolean> => {
    const data = await BuyHistoryPersistence.findByPk(id);
    if(!data) {
      throw new AppError({
        statusCode: HttpCode.NOT_FOUND,
        description: BuyHistoryErrMessage.NOT_FOUND,
      })
    }

    await data.destroy({ transaction: option?.transaction });
    return true;
  }

  findByCommodity = async (commodityId: string): Promise<BuyHistoryDomain[]>  => {
    const data = await BuyHistoryPersistence.findAll({
      include: {
        model: CommodityPersistence,
        attributes: ["name", "unit"],
      },
      where: {
        commodityId,
      },
    })

    return data.map((el) => BuyHistoryDomain.create(el.toJSON()));
  }

  countPrice = async (
    filter: DashboardFilter, 
    dateRange: DateRange
  ):  Promise<{ totalPrice: string, totalTransactions: number }> => {
    const unitByFilter: Partial<Record<DashboardFilter, TimeUnit>> = {
      [ENUM_FILTER_DASHBOARD.DAY]: "day",
      [ENUM_FILTER_DASHBOARD.MONTH]: "month",
      [ENUM_FILTER_DASHBOARD.YEAR]: "year",
    };

    const unit = unitByFilter[filter];

    let whereSql = `WHERE "deleted_at" IS NULL`;
    let replacements: Record<string, unknown> = {};

    if (filter === ENUM_FILTER_DASHBOARD.DATE_RANGE) {
      whereSql += ` AND "date" >= :from AND "date" <= :to`;
      replacements = {
        from: dateRange?.from,
        to: dateRange?.to,
      };
    } else if (unit) {
      whereSql += ` AND "date" >= :from AND "date" <= :to`;
      replacements = {
        from: dayjs().startOf(unit).format(DateFormat),
        to: dayjs().endOf(unit).format(DateFormat),
      };
    }

    const [row = { total: "0", total_transactions: 0 }] =
      await sequelize.query<{
        total: string;
        total_transactions: number;
      }>(
      `
      SELECT
        COALESCE(SUM("total_price"), 0)::text AS total,
        COUNT(*)::int AS total_transactions
      FROM "buy_histories"
      ${whereSql}
      `,
      { replacements, type: QueryTypes.SELECT }
    );

    return {
      totalPrice: row.total,
      totalTransactions: row.total_transactions,
    };
  };

  countPricePrevious = async (filter: DashboardFilter, dateRange: DateRange): Promise<string> => {
    const unitByFilter: Partial<Record<DashboardFilter, TimeUnit>> = {
      [ENUM_FILTER_DASHBOARD.DAY]: "day",
      [ENUM_FILTER_DASHBOARD.MONTH]: "month",
      [ENUM_FILTER_DASHBOARD.YEAR]: "year",
    };

    if (filter === ENUM_FILTER_DASHBOARD.DATE_RANGE) {
      if (!dateRange?.from || !dateRange?.to) return "0";

      const [row = { total: "0" }] = await sequelize.query<{ total: string }>(
        `
        SELECT COALESCE(SUM("total_price"), 0)::text AS total
        FROM "buy_histories"
        WHERE "deleted_at" IS NULL
          AND "date" >= :from
          AND "date" <= :to
        `,
        {
          replacements: { from: dateRange.from, to: dateRange.to },
          type: QueryTypes.SELECT,
        }
      );

      return row.total;
    }

    const unit = unitByFilter[filter];
    if (!unit) return "0"; // ALL doesn't have a meaningful "previous" period for trend

    const base = dayjs().subtract(1, unit);

    const replacements = {
      from: base.startOf(unit).format(DateFormat),
      to: base.endOf(unit).format(DateFormat),
    };

    const [row = { total: "0" }] = await sequelize.query<{ total: string }>(
      `
      SELECT COALESCE(SUM("total_price"), 0)::text AS total
      FROM "buy_histories"
      WHERE "deleted_at" IS NULL
        AND "date" >= :from
        AND "date" <= :to
      `,
      { replacements, type: QueryTypes.SELECT }
    );

    return row.total;
  };

  async findMinMaxDate(): Promise<{ minDate?: string; maxDate?: string }> {
    const rows = await sequelize.query<{ min_date: string | null; max_date: string | null }>(
      `
      SELECT
        MIN("date")::text AS min_date,
        MAX("date")::text AS max_date
      FROM "buy_histories"
      WHERE "deleted_at" IS NULL
      `,
      { type: QueryTypes.SELECT }
    );

    const r = rows[0];
    return {
      minDate: r?.min_date ?? undefined,
      maxDate: r?.max_date ?? undefined,
    };
  }

  async findBucketedSeries(
    from: string | undefined,
    to: string | undefined,
    granularity: DashboardGranularity,
    metric: DashboardMetric
  ): Promise<Record<string, Decimal>> {
    const whereDate =
      from && to
        ? `
          AND "date" >= :from
          AND "date" <= :to
        `
        : '';

    const replacements: Record<string, string> = {};
    if (from && to) {
      replacements.from = from;
      replacements.to = to;
    }

    const bucketExpr =
      granularity === 'day'
        ? `("date")::date`
        : granularity === 'week'
          ? `(date_trunc('week', (("date")::timestamp + interval '1 day')) - interval '1 day')::date`
          : `date_trunc('month', ("date")::timestamp)::date`;

    const valueExpr = metric === 'qty' ? `"qty"` : `"total_price"`;

    const rows = await sequelize.query<{ bucket: string; value: string }>(
      `
      SELECT
        (${bucketExpr})::text AS bucket,
        COALESCE(SUM(${valueExpr}), 0)::text AS value
      FROM "buy_histories"
      WHERE "deleted_at" IS NULL
        ${whereDate}
      GROUP BY 1
      ORDER BY 1 ASC
      `,
      {
        replacements,
        type: QueryTypes.SELECT,
      }
    );

    const out: Record<string, Decimal> = {};
    for (const r of rows) {
      out[r.bucket] = toDecimal(r.value);
    }
    return out;
  }
}
