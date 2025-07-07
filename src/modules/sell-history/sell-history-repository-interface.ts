import { BaseQueryOption } from "../common/dto/common-dto";
import BaseRepository from "../common/interfaces/base-repository-interface";
import { SellHistoryDomain, ISellHistory } from "./sell-history-domain";

export interface ISellHistoryRepository 
  extends BaseRepository<SellHistoryDomain, ISellHistory> 
{
  findByCommodity(commodityId: string): Promise<SellHistoryDomain[]>,
  update(id: string, props: Partial<ISellHistory>, option?: BaseQueryOption): Promise<SellHistoryDomain>,
  delete(id: string, option?: BaseQueryOption): Promise<boolean>,
}
