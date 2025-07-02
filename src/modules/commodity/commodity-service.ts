import TYPES from "@/types";
import { inject, injectable } from "inversify";
import { ICommodity } from "./commodity-domain";
import { ICommodityRepository } from "./commodity-repository-interface";

@injectable()
export class CommodityService {
  constructor (
    @inject(TYPES.ICommodityRepository) private _repository: ICommodityRepository,
  ) {}

  public store = async (props: ICommodity): Promise<ICommodity> => {
    return (await this._repository.store(props)).unmarshal();
  }
}