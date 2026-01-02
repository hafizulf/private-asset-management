import { injectable } from "inversify";
import { TStandardPaginateOption } from "../common/dto/pagination-dto";
import { Pagination } from "../common/pagination";
import { AppError, HttpCode } from "@/exceptions/app-error";
import { 
  SellHistory as SellHistoryPersistence,
  Commodity as CommodityPersistence,
} from "@/modules/common/sequelize";
import { Op, Sequelize } from "sequelize";
import { BaseQueryOption } from "../common/dto/common-dto";
import { ISellHistory, SellHistoryDomain } from "./sell-history-domain";
import { ISellHistoryRepository } from "./sell-history-repository-interface";
import { SellHistoryErrMessage } from "@/exceptions/error-message-constants";

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
}