import TYPES from "@/types";
import { inject, injectable } from "inversify";
import { BuyHistoryDomain, IBuyHistory } from "./buy-history-domain";
import { IBuyHistoryRepository } from "./buy-history-repository-interface";
import { ICommodityRepository } from "@/modules/commodity/commodity-repository-interface";
import { AppError, HttpCode } from "@/exceptions/app-error";
import { CommodityErrMessage } from "@/exceptions/error-message-constants";
import { TStandardPaginateOption } from "../common/dto/pagination-dto";
import { Pagination } from "../common/pagination";
import { IBuyHistoryView, ICommodityBuyHistoryView } from "./buy-history-dto";

@injectable()
export class BuyHistoryService {
  constructor (
    @inject(TYPES.ICommodityRepository) private _commodityRepository: ICommodityRepository,
    @inject(TYPES.IBuyHistoryRepository) private _repository: IBuyHistoryRepository,
  ) {}

  public store = async (props: IBuyHistory): Promise<IBuyHistory> => {
    const commodity = await this._commodityRepository.findById(props.commodityId);
    if(!commodity) {
      throw new AppError({
        statusCode: HttpCode.NOT_FOUND,
        description: CommodityErrMessage.NOT_FOUND,
      })
    }

    return (await this._repository.store(props)).unmarshal();
  }

  public async findAll(
    paginateOption?: TStandardPaginateOption
  ): Promise<[IBuyHistoryView[], Pagination?]> {
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

    const response: ICommodityBuyHistoryView = {
      commodityId: data[0]?.commodityId!,
      commodityName: data[0]?.commodity?.name!,
      totalQty: data.reduce((sum, el) => sum + el.qty, 0),
      totalPrice: data.reduce((sum, el) => sum + el.totalPrice, 0),
      buyHistories: [],
    }

    data.sort((a, b) => b.date.getTime() - a.date.getTime()); // sort by date desc
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
}