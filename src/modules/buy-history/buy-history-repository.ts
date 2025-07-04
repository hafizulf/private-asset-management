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
import { Op, Sequelize } from "sequelize";
import { BaseQueryOption } from "../common/dto/common-dto";

@injectable()
export class BuyHistoryRepository implements IBuyHistoryRepository {
  findAll = async (): Promise<BuyHistoryDomain[]> => {
    const data = await BuyHistoryPersistence.findAll();
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

  update = async (id: string, props: IBuyHistory): Promise<BuyHistoryDomain> => {
    const data = await BuyHistoryPersistence.findByPk(id);
    if(!data) {
      throw new AppError({
        statusCode: HttpCode.NOT_FOUND,
        description: BuyHistoryErrMessage.NOT_FOUND,
      })
    }
    const updatedBuyHistory = await data.update(props);
    return BuyHistoryDomain.create(updatedBuyHistory.toJSON());
  }

  delete = async (id: string): Promise<boolean> => {
    const data = await BuyHistoryPersistence.findByPk(id);
    if(!data) {
      throw new AppError({
        statusCode: HttpCode.NOT_FOUND,
        description: BuyHistoryErrMessage.NOT_FOUND,
      })
    }

    await data.destroy();
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
}