import TYPES from "@/types";
import { inject, injectable } from "inversify";
import { SellHistoryDomain, ISellHistory } from "./sell-history-domain";
import { ISellHistoryRepository } from "./sell-history-repository-interface";
import { ICommodityRepository } from "@/modules/commodity/commodity-repository-interface";
import { AppError, HttpCode } from "@/exceptions/app-error";
import {  CommodityErrMessage, StockAssetErrMessage } from "@/exceptions/error-message-constants";
import { TStandardPaginateOption } from "../common/dto/pagination-dto";
import { Pagination } from "../common/pagination";
import { ISellHistoryView, ICommoditySellHistoryView } from "./sell-history-dto";
import { ManageDbTransactionService } from "../common/services/manage-db-transaction-service";
import { Transaction } from "sequelize";
import { IStockAssetRepository } from "../stock-assets/stock-asset-repository-interface";
import { IAuditLogsRepository } from "../audit-logs/audit-logs-repository-interface";

@injectable()
export class SellHistoryService {
  constructor (
    @inject(TYPES.ManageDbTransactionService) private _dbTransactionService: ManageDbTransactionService,
    @inject(TYPES.ICommodityRepository) private _commodityRepository: ICommodityRepository,
    @inject(TYPES.ISellHistoryRepository) private _repository: ISellHistoryRepository,
    @inject(TYPES.IStockAssetRepository) private _stockAssetRepository: IStockAssetRepository,
    @inject(TYPES.IAuditLogsRepository) private _auditLogsRepository: IAuditLogsRepository,
  ) {}

  public store = async (props: ISellHistory, userId: string): Promise<ISellHistory> => {
    const result = await this._dbTransactionService.handle(
      async (transaction: Transaction) => {
        const commodity = await this._commodityRepository.findById(props.commodityId);
        if(!commodity) {
          throw new AppError({
            statusCode: HttpCode.NOT_FOUND,
            description: CommodityErrMessage.NOT_FOUND,
          })
        }

        const dataStockAsset = await this._stockAssetRepository.findByCommodityId(props.commodityId);
        const stockQty = dataStockAsset.qty;
        const qtyToSale = props.qty;

        if(stockQty < qtyToSale) {
          throw new AppError({
            statusCode: HttpCode.BAD_REQUEST,
            description: StockAssetErrMessage.INSUFFICIENT_STOCK,
          })
        }

        const qty = stockQty - qtyToSale;

        await this._stockAssetRepository.update(dataStockAsset.id, { qty }, { transaction });  // update stock asset
        const storedSellHistory = (await this._repository.store(props, { transaction })).unmarshal();  // store sell history
        await this._auditLogsRepository.store({  // add logs
          userId,
          type: "sell",
          action: "create",
          payload: { after: storedSellHistory },
        }, { transaction });

        return storedSellHistory;
      },
      "Failed to store sell history",
    )

    return result;
  }

  public findAll = async (
    paginateOption?: TStandardPaginateOption
  ): Promise<[ISellHistoryView[], Pagination?]> => {
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

    return [this.transformData(await this._repository.findAll())];
  }

  private transformData(data: SellHistoryDomain[]): ISellHistoryView[] {
    const transformedData = data.map((el) => {
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
    return transformedData;
  }

  public findOne = async (id: string): Promise<ISellHistoryView> => {
    const data = await this._repository.findById(id);
    const { commodity, ...rest } = data.unmarshal();

    return {
      ...rest,
      createdAt: undefined,
      updatedAt: undefined,
      deletedAt: undefined,
      commodityName: commodity?.name ?? "",
      commodityUnit: commodity?.unit ?? "",
    }
  }

  public findByCommodity = async (commodityId: string): Promise<ICommoditySellHistoryView | []> => {
    const commodity = await this._commodityRepository.findById(commodityId);
    if(!commodity) {
      throw new AppError({
        statusCode: HttpCode.NOT_FOUND,
        description: CommodityErrMessage.NOT_FOUND,
      })
    } 

    const data = (await this._repository.findByCommodity(commodityId)).map((el) => el.unmarshal());
    if(data.length === 0) {
      return [];
    }

    const response: ICommoditySellHistoryView = {
      commodityId: data[0]?.commodityId!,
      commodityName: data[0]?.commodity?.name!,
      totalQty: `${data.reduce((sum, el) => sum + el.qty, 0)} ${data[0]?.commodity?.unit}`,
      totalPrice: data.reduce((sum, el) => sum + el.totalPrice, 0),
      sellHistories: [],
    }

    // if a > b, return -1 will sort a before b, if a < b, return 1 will sort a after b
    data.sort((a, b) => (a.date > b.date ? -1 : 1)); 
    
    data.forEach((el) => {
      response.sellHistories.push({
        ...el,
        commodityId: undefined!,
        commodity: undefined,
        createdAt: undefined,
        updatedAt: undefined,
        deletedAt: undefined,
      });
    })

    return response;
  }

  public update = async (id: string, props: Partial<ISellHistory>, userId: string): Promise<ISellHistory> => {
    const result = await this._dbTransactionService.handle(
      async (transaction: Transaction) => {
        const data = await this._repository.findById(id);
        const dataStockAsset = await this._stockAssetRepository.findByCommodityId(data.commodityId);

        const newSaleQty = props.qty ?? data.qty;
        const qtyDiff = data.qty - newSaleQty;
        const qty = dataStockAsset.qty + qtyDiff;

        if(qty < 0) {
          throw new AppError({
            statusCode: HttpCode.BAD_REQUEST,
            description: StockAssetErrMessage.INSUFFICIENT_STOCK,
          })
        }

        await this._stockAssetRepository.update(dataStockAsset.id,  { qty }, { transaction });
        const dataBefore = await this._repository.findById(id);
        const updatedSellHistory = (await this._repository.update(id, props, { transaction })).unmarshal();
        await this._auditLogsRepository.store({
          userId,
          type: "sell",
          action: "update",
          payload: { before: dataBefore, after: updatedSellHistory },
        }, { transaction });

        return updatedSellHistory;
      },
      "Failed to update sell history",
    )

    return result;
  }

  public delete = async (id: string, userId: string): Promise<boolean> => {
    const result = await this._dbTransactionService.handle(
      async (transaction: Transaction) => {
        const data = await this._repository.findById(id);
        const dataStockAsset = await this._stockAssetRepository.findByCommodityId(data.commodityId);
        const qty = dataStockAsset.qty + data.qty;

        await this._stockAssetRepository.update(dataStockAsset.id,  { qty }, { transaction });
        await this._auditLogsRepository.store({
          userId,
          type: "sell",
          action: "delete",
          payload: { after: data.unmarshal() },
        }, { transaction });
        return (await this._repository.delete(id, { transaction }));
      },
      "Failed to delete sell history",
    )

    return result;
  }
}
