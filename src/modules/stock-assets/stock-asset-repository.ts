import { injectable } from "inversify";
import { IStockAssetRepository } from "./stock-asset-repository-interface";
import { TStandardPaginateOption } from "../common/dto/pagination-dto";
import { Pagination } from "../common/pagination";
import { StockAssetDomain, IStockAsset } from "./stock-asset-domain";
import { BaseQueryOption } from "../common/dto/common-dto";
import { StockAsset as StockAssetPersistence } from "@/modules/common/sequelize";

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
  update(_id: string, _props: IStockAsset): Promise<StockAssetDomain> {
    throw new Error("Method not implemented.");
  }
  delete(_id: string): Promise<boolean> {
    throw new Error("Method not implemented.");
  }
  
}