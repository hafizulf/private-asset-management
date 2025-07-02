import BaseRepository from "../common/interfaces/base-repository-interface";
import { BuyHistoryDomain, IBuyHistory } from "./buy-history-domain";

export interface IBuyHistoryRepository 
  extends BaseRepository<BuyHistoryDomain, IBuyHistory> 
{
  findByCommodity(commodityId: string): Promise<BuyHistoryDomain[]>
}
