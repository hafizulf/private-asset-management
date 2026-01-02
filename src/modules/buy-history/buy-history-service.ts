import TYPES from "@/types";
import { inject, injectable } from "inversify";
import { BuyHistoryDomain, IBuyHistory } from "./buy-history-domain";
import { IBuyHistoryRepository } from "./buy-history-repository-interface";
import { ICommodityRepository } from "@/modules/commodity/commodity-repository-interface";
import { AppError, HttpCode } from "@/exceptions/app-error";
import {  CommodityErrMessage, StockAssetErrMessage } from "@/exceptions/error-message-constants";
import { TStandardPaginateOption } from "../common/dto/pagination-dto";
import { Pagination } from "../common/pagination";
import { IBuyHistoryView, ICommodityBuyHistoryView } from "./buy-history-dto";
import { ManageDbTransactionService } from "../common/services/manage-db-transaction-service";
import { Transaction } from "sequelize";
import { IStockAssetRepository } from "../stock-assets/stock-asset-repository-interface";
import { IAuditLogsRepository } from "../audit-logs/audit-logs-repository-interface";
import { toDecimal } from "@/helpers/math.helper";
import Decimal from "decimal.js";

@injectable()
export class BuyHistoryService {
  constructor (
    @inject(TYPES.ManageDbTransactionService) private _dbTransactionService: ManageDbTransactionService,
    @inject(TYPES.ICommodityRepository) private _commodityRepository: ICommodityRepository,
    @inject(TYPES.IBuyHistoryRepository) private _repository: IBuyHistoryRepository,
    @inject(TYPES.IStockAssetRepository) private _stockAssetRepository: IStockAssetRepository,
    @inject(TYPES.IAuditLogsRepository) private _auditLogsRepository: IAuditLogsRepository,
  ) {}

  public store = async (props: IBuyHistory, userId: string): Promise<IBuyHistory> => {
    const result = await this._dbTransactionService.handle(
      async (transaction: Transaction) => {
        const commodity = await this._commodityRepository.findById(props.commodityId);
        if(!commodity) {
          throw new AppError({
            statusCode: HttpCode.NOT_FOUND,
            description: CommodityErrMessage.NOT_FOUND,
          })
        }

        // create or update stock asset
        await this._stockAssetRepository.createOrUpdate({
          commodityId: commodity.id,
          qty: toDecimal(props.qty).toFixed(2),
        }, { transaction });
    
        // store buy history
        const storedBuyHistory = (await this._repository.store(props, { transaction })).unmarshal();

        // add logs
        await this._auditLogsRepository.store({
          userId,
          type: "buy",
          action: "create",
          payload: { after: storedBuyHistory },
        }, { transaction });

        return storedBuyHistory;
      },
      "Failed to store buy history",
    )

    return result;
  }

  public findAll = async (
    paginateOption?: TStandardPaginateOption
  ): Promise<[IBuyHistoryView[], Pagination?]> => {
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

  private transformData(data: BuyHistoryDomain[]): IBuyHistoryView[] {
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

  public findOne = async (id: string): Promise<IBuyHistoryView> => {
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

  public findByCommodity = async (commodityId: string): Promise<ICommodityBuyHistoryView | []> => {
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

    const totalQty = data.reduce((sum, el) => sum.plus(toDecimal(el.qty)), new Decimal(0));
    const totalPrice = data.reduce((sum, el) => sum.plus(toDecimal(el.totalPrice)), new Decimal(0));

    const response: ICommodityBuyHistoryView = {
      commodityId: data[0]?.commodityId!,
      commodityName: data[0]?.commodity?.name!,
      totalQty: `${totalQty.toFixed(2)} ${data[0]!.commodity!.unit}`,
      totalPrice: Number(totalPrice.toFixed(2)),
      buyHistories: [],
    }

    // if a > b, return -1 will sort a before b, if a < b, return 1 will sort a after b
    data.sort((a, b) => (a.date > b.date ? -1 : 1)); 
    
    data.forEach((el) => {
      response.buyHistories.push({
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

  public update = async (id: string, props: IBuyHistory, userId: string): Promise<IBuyHistory> => {
    const result = await this._dbTransactionService.handle(
      async (transaction: Transaction) => {
        const data = await this._repository.findById(id);
        const currentQty = toDecimal(data.qty);
        const newQty = toDecimal(props.qty);

        // compare using Decimal (not !==)
        if (!newQty.eq(currentQty)) {
          const dataStockAsset = await this._stockAssetRepository.findByCommodityId(data.commodityId);
          const stockQty = toDecimal(dataStockAsset.qty);

          // If buy qty increases, stock increases. If decreases, stock decreases.
          const qtyDiff = newQty.minus(currentQty);
          const finalResult = stockQty.plus(qtyDiff);

          if (finalResult.lt(0)) {
            throw new AppError({
              statusCode: HttpCode.BAD_REQUEST,
              description: StockAssetErrMessage.INSUFFICIENT_STOCK,
            });
          }

          await this._stockAssetRepository.update(
            dataStockAsset.id,
            { qty: finalResult.toFixed(2) },
            { transaction }
          );
        }

        const dataBefore = await this._repository.findById(id);
        const updatedBuyHistory = (await this._repository.update(id, props, { transaction })).unmarshal();

        await this._auditLogsRepository.store({
          userId,
          type: "buy",
          action: "update",
          payload: { 
            before: dataBefore.unmarshal(),
            after: updatedBuyHistory
          },
        }, { transaction });

        return updatedBuyHistory;
      },
      "Failed to update buy history",
    )

    return result;
  }

  public delete = async (id: string, userId: string): Promise<boolean> => {
    const result = await this._dbTransactionService.handle(
      async (transaction: Transaction) => {
        const data = await this._repository.findById(id);
        const dataStockAsset = await this._stockAssetRepository.findByCommodityId(data.commodityId);

        const stockQty = toDecimal(dataStockAsset.qty);
        const qtyDiff = toDecimal(data.qty);
        const finalResult = stockQty.minus(qtyDiff);

        if (finalResult.lt(0)) {
          throw new AppError({
            statusCode: HttpCode.BAD_REQUEST,
            description: StockAssetErrMessage.INSUFFICIENT_STOCK,
          });
        }

        await this._stockAssetRepository.update(
          dataStockAsset.id,
          { qty: finalResult.toFixed(2) },
          { transaction }
        );

        await this._auditLogsRepository.store({
          userId,
          type: "buy",
          action: "delete",
          payload: { after: data.unmarshal() },
        }, { transaction });
    
        return (await this._repository.delete(id, { transaction }));
      },
      "Failed to delete buy history",
    )

    return result;
  }
}
