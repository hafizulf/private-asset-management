import { BaseQueryOption } from "../common/dto/common-dto";
import BaseRepository from "../common/interfaces/base-repository-interface";
import { DashboardFilter, DateRange } from "../dashboard-totals/dashboard-total.dto";
import { SellHistoryDomain, ISellHistory } from "./sell-history-domain";

export interface ISellHistoryRepository 
  extends BaseRepository<SellHistoryDomain, ISellHistory> 
{
  findByCommodity(commodityId: string): Promise<SellHistoryDomain[]>,
  update(id: string, props: Partial<ISellHistory>, option?: BaseQueryOption): Promise<SellHistoryDomain>,
  delete(id: string, option?: BaseQueryOption): Promise<boolean>,
  countPrice(filter: DashboardFilter, dateRange?: DateRange): Promise<{ totalTransactions: number, totalPrice: string }>;
  countPricePrevious(filter: DashboardFilter, dateRange?: DateRange): Promise<string>,
}
