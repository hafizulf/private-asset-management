import { injectable } from "inversify";
import { IStockAssetRepository } from "./stock-asset-repository-interface";
import { TStandardPaginateOption } from "../common/dto/pagination-dto";
import { Pagination } from "../common/pagination";
import { StockAssetDomain, IStockAsset } from "./stock-asset-domain";
import { BaseQueryOption } from "../common/dto/common-dto";
import { 
  StockAsset as StockAssetPersistence,
  Commodity as CommodityPersistence,
} from "@/modules/common/sequelize";
import { AppError, HttpCode } from "@/exceptions/app-error";
import { Op, Sequelize } from "sequelize";
import { toDecimal } from "@/helpers/math.helper";

@injectable()
export class StockAssetRepository implements IStockAssetRepository {
  createOrUpdate = async (props: IStockAsset, option: BaseQueryOption): Promise<void> => {
    const dataAsset = await StockAssetPersistence.findOne({
      where: {
        commodityId: props.commodityId,
      }
    })

    if(dataAsset) {
      await dataAsset.update({
        qty: toDecimal(dataAsset.qty).plus(toDecimal(props.qty)).toFixed(2),
      }, 
      { transaction: option.transaction }
      );
    } else {
      await StockAssetPersistence.create(props, { transaction: option.transaction });
    }

    return
  }

  findByCommodityId = async (commodityId: string): Promise<StockAssetDomain> => {
    const data = await StockAssetPersistence.findOne({
      include: [
        {
          model: CommodityPersistence,
          attributes: ["name", "unit"],
        },
      ],
      where: {
        commodityId: commodityId
      }
    });

    if(!data) {
      throw new AppError({
        statusCode: HttpCode.NOT_FOUND,
        description: "Stock asset by commodity not found",
      })
    }

    return StockAssetDomain.create(data.toJSON());
  }

  findAll = async (): Promise<StockAssetDomain[]> => {
    const data = await StockAssetPersistence.findAll({
      include: [
        {
          model: CommodityPersistence,
          attributes: ["name", "unit"],
        },
      ],
      order: [[Sequelize.col("commodity.name"), "DESC"]], // or "ASC" if you prefer
    });

    return data.map((el) => StockAssetDomain.create(el.toJSON()));
  };

  findAllWithPagination = async (
    paginateOption: TStandardPaginateOption, 
    pagination: Pagination
  ): Promise<[StockAssetDomain[], Pagination]> => {
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

    const { rows, count } = await StockAssetPersistence.findAndCountAll({
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
    return [rows.map((el) => StockAssetDomain.create(el.toJSON())), pagination];
  }

  store(_props: IStockAsset): Promise<StockAssetDomain> {
    throw new Error("Method not implemented.");
  }
  findById(_id: string): Promise<StockAssetDomain> {
    throw new Error("Method not implemented.");
  }

  update = async (
    id: string, 
    props: Partial<IStockAsset>, 
    option?: BaseQueryOption
  ): Promise<StockAssetDomain> => {
    const data = await StockAssetPersistence.findByPk(id);
    if(!data) {
      throw new AppError({
        statusCode: HttpCode.NOT_FOUND,
        description: "Stock asset not found",
      })
    }
    await data.update(props, { transaction: option?.transaction });
    return StockAssetDomain.create(data.toJSON());
  }

  delete(_id: string): Promise<boolean> {
    throw new Error("Method not implemented.");
  }
  
}