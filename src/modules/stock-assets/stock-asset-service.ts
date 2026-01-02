import TYPES from "@/types";
import { inject, injectable } from "inversify";
import { IStockAssetRepository } from "./stock-asset-repository-interface";
import { TStandardPaginateOption } from "../common/dto/pagination-dto";
import { IStockAsset, StockAssetDomain } from "./stock-asset-domain";
import { Pagination } from "../common/pagination";
import { ICommodityRepository } from "../commodity/commodity-repository-interface";
import { IStockAssetHistory } from "./stock-asset-dto";
import { IBuyHistoryRepository } from "../buy-history/buy-history-repository-interface";
import { ISellHistoryRepository } from "../sell-history/sell-history-repository-interface";
import { toDecimal } from "@/helpers/math.helper";
import Decimal from "decimal.js";

@injectable()
export class StockAssetService {
  constructor(
    @inject(TYPES.IStockAssetRepository) private _repository: IStockAssetRepository,
    @inject(TYPES.ICommodityRepository) private _commodityRepository: ICommodityRepository,
    @inject(TYPES.IBuyHistoryRepository) private _buyHistoryRepository: IBuyHistoryRepository,
    @inject(TYPES.ISellHistoryRepository) private _sellHistoryRepository: ISellHistoryRepository,
  ) {}

  public findAll = async (
    paginateOption?: TStandardPaginateOption
  ): Promise<[IStockAsset[], Pagination?]> => {
    if(
      paginateOption?.search ||
      (paginateOption?.page && paginateOption?.limit)
    ) {
      const pagination = Pagination.create({
        page: <number>paginateOption.page,
        limit: <number>paginateOption.limit,
      })
      const [data, paginateResult] = await this._repository.findAllWithPagination(paginateOption, pagination);
      return [this.transformData(data), paginateResult];
    }

    return [this.transformData(await this._repository.findAll()), undefined];
  }

  private transformData(data: StockAssetDomain[]): IStockAsset[] {
    return data.map((el) => {
      const { commodity, ...rest } = el.unmarshal();
      return {
        ...rest,
        createdAt: undefined,
        updatedAt: undefined,
        deletedAt: undefined,
        commodityName: commodity?.name ?? "",
        commodityUnit: commodity?.unit ?? "",
      };
    })
  }

  public findAllByCommodity = async (commodityId: string): Promise<IStockAssetHistory> => {
    await this._commodityRepository.findById(commodityId);
    const dataStockAssets = await this._repository.findByCommodityId(commodityId);
    const dataBuyHistories = (await this._buyHistoryRepository.findByCommodity(commodityId)).map((el) => {
      return {
        ...el.unmarshal(),
        commodity: undefined,
        createdAt: undefined,
        updatedAt: undefined,
        deletedAt: undefined
      }
    });
    const dataSellHistories = (await this._sellHistoryRepository.findByCommodity(commodityId)).map((el) => {
      return {
        ...el.unmarshal(),
        commodity: undefined,
        createdAt: undefined,
        updatedAt: undefined,
        deletedAt: undefined
      }
    });
    const { commodity, ...rest } = dataStockAssets.unmarshal();
    const commodityUnit = commodity?.unit ?? "";

    const totalBuyingPrice = dataBuyHistories.reduce(
      (sum, curr) => sum.plus(toDecimal(curr.totalPrice)),
      new Decimal(0)
    );

    const totalSellingPrice = dataSellHistories.reduce(
      (sum, curr) => sum.plus(toDecimal(curr.totalPrice)),
      new Decimal(0)
    );

    const totalAssetValue = totalBuyingPrice.minus(totalSellingPrice);
    const totalProfit = totalSellingPrice.minus(totalBuyingPrice);

    return {
      ...rest,
      commodityName: commodity?.name ?? "",
      quantity: `${rest.qty} ${commodityUnit}`,
      totalAssetValue: Number(totalAssetValue.toFixed(2)),
      totalProfit: Number(totalProfit.toFixed(2)),
      totalBuyingPrice: Number(totalBuyingPrice.toFixed(2)),
      totalSellingPrice: Number(totalSellingPrice.toFixed(2)),
      buyHistories: dataBuyHistories,
      sellHistories: dataSellHistories,
      createdAt: undefined,
      updatedAt: undefined,
      deletedAt: undefined,
    }
  }
}
