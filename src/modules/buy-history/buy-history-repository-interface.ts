import Decimal from "decimal.js";
import { BaseQueryOption } from "../common/dto/common-dto";
import BaseRepository from "../common/interfaces/base-repository-interface";
import { DashboardFilter, DashboardGranularity, DashboardMetric, DateRange } from "../dashboard-totals/dashboard-total.dto";
import { BuyHistoryDomain, IBuyHistory } from "./buy-history-domain";

export interface IBuyHistoryRepository 
  extends BaseRepository<BuyHistoryDomain, IBuyHistory> 
{
  findByCommodity(commodityId: string): Promise<BuyHistoryDomain[]>,
  update(id: string, props: Partial<IBuyHistory>, option?: BaseQueryOption): Promise<BuyHistoryDomain>,
  delete(id: string, option?: BaseQueryOption): Promise<boolean>,
  countPrice(filter: DashboardFilter, dateRange?: DateRange): Promise<{ totalTransactions: number, totalPrice: string }>;
  countPricePrevious(filter: DashboardFilter, dateRange?: DateRange): Promise<string>;
  findMinMaxDate(): Promise<{ minDate?: string; maxDate?: string }>;
  findBucketedSeries(
    from: string | undefined,
    to: string | undefined,
    granularity: DashboardGranularity,
    metric: DashboardMetric
  ): Promise<Record<string, Decimal>>;
}
