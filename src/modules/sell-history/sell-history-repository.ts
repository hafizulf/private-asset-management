import { injectable } from "inversify";
import { TStandardPaginateOption } from "../common/dto/pagination-dto";
import { Pagination } from "../common/pagination";
import { AppError, HttpCode } from "@/exceptions/app-error";
import { 
  SellHistory as SellHistoryPersistence,
  Commodity as CommodityPersistence,
} from "@/modules/common/sequelize";
import { Op, QueryTypes, Sequelize } from "sequelize";
import { BaseQueryOption } from "../common/dto/common-dto";
import { ISellHistory, SellHistoryDomain } from "./sell-history-domain";
import { ISellHistoryRepository } from "./sell-history-repository-interface";
import { SellHistoryErrMessage } from "@/exceptions/error-message-constants";
import { DashboardFilter, DateFormat, DateRange, ENUM_FILTER_DASHBOARD } from "../dashboard-totals/dashboard-total.dto";
import { sequelize } from "@/config/database";
import dayjs from "dayjs";

@injectable()
export class SellHistoryRepository implements ISellHistoryRepository {
  findAll = async (): Promise<SellHistoryDomain[]> => {
    const data = await SellHistoryPersistence.findAll({
      include: [
        {
          model: CommodityPersistence, 
          attributes: ["name", "unit"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });
    return data.map((el) => SellHistoryDomain.create(el.toJSON()));
  }

  findAllWithPagination = async (
    paginateOption: TStandardPaginateOption, 
    pagination: Pagination
  ): Promise<[SellHistoryDomain[], Pagination]> => {
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

    const { rows, count } = await SellHistoryPersistence.findAndCountAll({
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
    return [rows.map((el) => SellHistoryDomain.create(el.toJSON())), pagination];
  }

  store = async (props: ISellHistory, option?: BaseQueryOption): Promise<SellHistoryDomain> => {
    const createdSellHistory = await SellHistoryPersistence.create(props, { transaction: option?.transaction });
    return SellHistoryDomain.create(createdSellHistory.toJSON());
  }

  findById = async (id: string): Promise<SellHistoryDomain> => {
    const data = await SellHistoryPersistence.findByPk(id, {
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
        description: SellHistoryErrMessage.NOT_FOUND,
      })
    }
    return SellHistoryDomain.create(data.toJSON());
  }

  update = async (
    id: string, 
    props: Partial<ISellHistory>,
    option?: BaseQueryOption,
  ): Promise<SellHistoryDomain> => {
    const data = await SellHistoryPersistence.findByPk(id);
    if(!data) {
      throw new AppError({
        statusCode: HttpCode.NOT_FOUND,
        description: SellHistoryErrMessage.NOT_FOUND,
      })
    }
    const updatedSellHistory = await data.update(props, { transaction: option?.transaction });
    return SellHistoryDomain.create(updatedSellHistory.toJSON());
  }

  delete = async (id: string, option?: BaseQueryOption): Promise<boolean> => {
    const data = await SellHistoryPersistence.findByPk(id);
    if(!data) {
      throw new AppError({
        statusCode: HttpCode.NOT_FOUND,
        description: SellHistoryErrMessage.NOT_FOUND,
      })
    }

    await data.destroy({ transaction: option?.transaction });
    return true;
  }

  findByCommodity = async (commodityId: string): Promise<SellHistoryDomain[]>  => {
    const data = await SellHistoryPersistence.findAll({
      include: {
        model: CommodityPersistence,
        attributes: ["name", "unit"],
      },
      where: {
        commodityId,
      },
    })

    return data.map((el) => SellHistoryDomain.create(el.toJSON()));
  }

  countPrice = async (
    filter: DashboardFilter, 
    dateRange: DateRange
  ): Promise<{ totalTransactions: number, totalPrice: string }> => {
    type TimeUnit = "day" | "month" | "year";
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
      FROM "sell_histories"
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
    type TimeUnit = "day" | "month" | "year";
    const unitByFilter: Partial<Record<DashboardFilter, TimeUnit>> = {
      [ENUM_FILTER_DASHBOARD.DAY]: "day",
      [ENUM_FILTER_DASHBOARD.MONTH]: "month",
      [ENUM_FILTER_DASHBOARD.YEAR]: "year",
    };

    if (filter === ENUM_FILTER_DASHBOARD.DATE_RANGE) {
      const [row = { total: "0" }] = await sequelize.query<{ total: string }>(
        `
        SELECT COALESCE(SUM("total_price"), 0)::text AS total
        FROM "sell_histories"
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
    if (!unit) return "0";

    const base = dayjs().subtract(1, unit);

    const replacements = {
      from: base.startOf(unit).format(DateFormat),
      to: base.endOf(unit).format(DateFormat),
    };

    const [row = { total: "0" }] = await sequelize.query<{ total: string }>(
      `
      SELECT COALESCE(SUM("total_price"), 0)::text AS total
      FROM "sell_histories"
      WHERE "deleted_at" IS NULL
        AND "date" >= :from
        AND "date" <= :to
      `,
      { replacements, type: QueryTypes.SELECT }
    );

    return row.total;
  };
}
