import { BaseQueryOption } from "../common/dto/common-dto";
import BaseRepository from "../common/interfaces/base-repository-interface";
import { IStockAsset, StockAssetDomain } from "./stock-asset-domain";

export interface IStockAssetRepository
  extends BaseRepository<StockAssetDomain, IStockAsset> {
    createOrUpdate(props: IStockAsset, option: BaseQueryOption): Promise<void>
  }