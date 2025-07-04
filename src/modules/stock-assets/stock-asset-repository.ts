import { injectable } from "inversify";
import { IStockAssetRepository } from "./stock-asset-repository-interface";
import { TStandardPaginateOption } from "../common/dto/pagination-dto";
import { Pagination } from "../common/pagination";
import { StockAssetDomain, IStockAsset } from "./stock-asset-domain";
import { BaseQueryOption } from "../common/dto/common-dto";
import { StockAsset as StockAssetPersistence } from "@/modules/common/sequelize";
import { AppError, HttpCode } from "@/exceptions/app-error";

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
        qty: dataAsset.qty + props.qty
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

  findAll(): Promise<StockAssetDomain[]> {
    throw new Error("Method not implemented.");
  }
  findAllWithPagination(_paginateOption: TStandardPaginateOption, _pagination: Pagination): Promise<[StockAssetDomain[], Pagination]> {
    throw new Error("Method not implemented.");
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