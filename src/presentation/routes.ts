import { Router } from "express";
import { injectable } from "inversify";
import { AnnouncementRoutes } from "@/modules/announcements/announcement-routes";
import { RoleRoutes } from "@/modules/roles/role-routes";
import { UserRoutes } from "@/modules/users/user-routes";
import { WebAuthRoutes } from "@/modules/authentications/web-auth-routes";
import { OriginRoutes } from "@/modules/origins/origin-routes";
import { BuyHistoryRoutes } from "@/modules/buy-history/buy-history-routes";
import { CommodityRoutes } from "@/modules/commodity/commodity-routes";
import { SellHistoryRoutes } from "@/modules/sell-history/sell-history-routes";
import { StockAssetRoutes } from "@/modules/stock-assets/stock-asset-routes";
import { AuditLogsRoutes } from "@/modules/audit-logs/audit-logs-routes";
import { BackUpRoutes } from "@/modules/back-up/back-up.routes";
import { DashboardTotalRoutes } from "@/modules/dashboard-totals/dashboard-total.routes";

@injectable()
export class Routes {
  constructor(
    private announcementRoutes: AnnouncementRoutes,
    private backUpRoutes: BackUpRoutes,
    private auditLogsRoutes: AuditLogsRoutes,
    private buyHistoryRoutes: BuyHistoryRoutes,
    private commodityRoutes: CommodityRoutes,
    private dashboardTotalRoutes: DashboardTotalRoutes,
    private originRoutes: OriginRoutes,
    private roleRoutes: RoleRoutes,
    private sellRoutes: SellHistoryRoutes,
    private stockAssetRoutes: StockAssetRoutes,
    private userRoutes: UserRoutes,
    private webAuthRoutes: WebAuthRoutes,
  ) {}

  public setRoutes(router: Router) {
    this.announcementRoutes.setRoutes(router);
    this.backUpRoutes.setRoutes(router);
    this.auditLogsRoutes.setRoutes(router);
    this.buyHistoryRoutes.setRoutes(router);
    this.commodityRoutes.setRoutes(router);
    this.dashboardTotalRoutes.setRoutes(router);
    this.originRoutes.setRoutes(router);
    this.roleRoutes.setRoutes(router);
    this.sellRoutes.setRoutes(router);
    this.stockAssetRoutes.setRoutes(router);
    this.userRoutes.setRoutes(router);
    this.webAuthRoutes.setRoutes(router);
  }
}
