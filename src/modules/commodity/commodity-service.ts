import TYPES from "@/types";
import { inject, injectable } from "inversify";
import { ICommodity } from "./commodity-domain";
import { ICommodityRepository } from "./commodity-repository-interface";
import { TStandardPaginateOption } from "../common/dto/pagination-dto";
import { Pagination } from "../common/pagination";
import { AppError, HttpCode } from "@/exceptions/app-error";
import { IBuyHistoryRepository } from "../buy-history/buy-history-repository-interface";

@injectable()
export class CommodityService {
  constructor (
    @inject(TYPES.ICommodityRepository) private _repository: ICommodityRepository,
    @inject(TYPES.IBuyHistoryRepository) private _buyHistoryRepository: IBuyHistoryRepository,
  ) {}

  public store = async (props: ICommodity): Promise<ICommodity> => {
    return (await this._repository.store(props)).unmarshal();
  }

  public findOne = async (id: string): Promise<ICommodity> => {
    return (await this._repository.findById(id)).unmarshal();
  }

  public findAll = async(paginateOption?: TStandardPaginateOption): Promise<[ICommodity[], Pagination?]> => {
    if(
      paginateOption?.search ||
      (paginateOption?.page && paginateOption?.limit)
    ) {
      const pagination = Pagination.create({
        page: <number>paginateOption.page,
        limit: <number>paginateOption.limit,
      })
      const [data, paginateResult] = await this._repository.findAllWithPagination(paginateOption, pagination);
      return [data.map((el) => el.unmarshal()), paginateResult];
    }

    return [(await this._repository.findAll()).map((el) => el.unmarshal()), undefined];
  }

  public update = async (id: string, props: ICommodity): Promise<ICommodity> => {
    return (await this._repository.update(id, props)).unmarshal();
  }

  public delete = async (id: string): Promise<boolean> => {
    const dataBuyHistory = await this._buyHistoryRepository.findByCommodity(id);
    if(dataBuyHistory.length > 0) {
      throw new AppError({
        statusCode: HttpCode.BAD_REQUEST,
        description: "Cannot delete commodity because it has buy history",
      })
    }

    // const dataSellHistory = await this._repository.findAllByCommodityId(id);
    // if(dataSellHistory.length > 0) {
    //   throw new AppError({
    //     statusCode: HttpCode.BAD_REQUEST,
    //     description: "Cannot delete commodity because it has sell history",
    //   })
    // }

    return (await this._repository.delete(id));
  }
}