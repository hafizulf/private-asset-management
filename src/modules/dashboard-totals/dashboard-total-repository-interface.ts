import { DashboardTotalDomain, IDashboardTotal } from "./dashboard-total-domain";
import { DashboardMetric, TopCommodityRow } from "./dashboard-total.dto";

export interface IDashboardTotalRepository {
  findAll(): Promise<DashboardTotalDomain[]>
  createOrUpdate(props: IDashboardTotal): Promise<void>
  findTopCommodities(
    from: string | undefined,
    to: string | undefined,
    metric: DashboardMetric,
    limit: number,
  ): Promise<TopCommodityRow[]>
}
