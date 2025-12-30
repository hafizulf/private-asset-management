import "reflect-metadata";
import { Container } from "inversify";
import TYPES from "./types";

// Import Bootstrap / kernel / libs
import { IServer, Server } from "@/presentation/server";
import { Bootstrap } from "@/presentation/bootstrap";
import { Cron } from "@/libs/cron-job/cron";

// Import Routes
import { Routes } from "@/presentation/routes";
import { WebAuthRoutes } from "@/modules/authentications/web-auth-routes";
import { UserRoutes } from "@/modules/users/user-routes";
import { RoleRoutes } from "@/modules/roles/role-routes";
import { AnnouncementRoutes } from "@/modules/announcements/announcement-routes";
import { OriginRoutes } from "@/modules/origins/origin-routes";
import { BuyHistoryRoutes } from "@/modules/buy-history/buy-history-routes";
import { CommodityRoutes } from "@/modules/commodity/commodity-routes";
import { SellHistoryRoutes } from "@/modules/sell-history/sell-history-routes";
import { StockAssetRoutes } from "@/modules/stock-assets/stock-asset-routes";
import { AuditLogsRoutes } from "@/modules/audit-logs/audit-logs-routes";
import { BackUpRoutes } from "@/modules/back-up/back-up.routes";

// Import Middlewares
import { AuthMiddleware } from "@/presentation/middlewares/auth-middleware";

// Import Controllers
import { WebAuthController } from "@/modules/authentications/web-auth-controller";
import { RoleController } from "@/modules/roles/role-controller";
import { UserController } from "@/modules/users/user-controller";
import { AnnouncementController } from "@/modules/announcements/announcement-controller";
import { OriginController } from "@/modules/origins/origin-controller";
import { BuyHistoryController } from "@/modules/buy-history/buy-history-controller";
import { CommodityController } from "@/modules/commodity/commodity-controller";
import { SellHistoryController } from "@/modules/sell-history/sell-history-controller";
import { StockAssetController } from "@/modules/stock-assets/stock-asset-controller";
import { AuditLogsController } from "@/modules/audit-logs/audit-logs-controller";
import { BackUpController } from "@/modules/back-up/back-up.controller";

// Import Services
import { BackgroundServiceManager } from "./modules/common/services/background-service-manager";
import { WebAuthService } from "@/modules/authentications/web-auth-service";
import { RoleService } from "@/modules/roles/role-service";
import { UserService } from "@/modules/users/user-service";
import { RefreshTokenService } from "@/modules/refresh-tokens/refresh-token-service";
import { DashboardTotalService } from "@/modules/dashboard-totals/dashboard-total-service";
import { AnnouncementService } from "@/modules/announcements/announcement-service";
import { ManageDbTransactionService } from "@/modules/common/services/manage-db-transaction-service";
import { UserLogsService } from "@/modules/user-logs/user-logs-service";
import { OriginService } from "@/modules/origins/origin-service";
import { BuyHistoryService } from "@/modules/buy-history/buy-history-service";
import { CommodityService } from "@/modules/commodity/commodity-service";
import { SellHistoryService } from "@/modules/sell-history/sell-history-service";
import { StockAssetService } from "@/modules/stock-assets/stock-asset-service";
import { AuditLogsService } from "@/modules/audit-logs/audit-logs-service";
import { BackUpService } from "./modules/back-up/back-up.service";

// Import Interface Repository
import { IRoleRepository } from "@/modules/roles/role-repository-interface";
import { IUserRepository } from "@/modules/users/user-repository-interface";
import { IRefreshTokenRepository } from "@/modules/refresh-tokens/refresh-token-repository-interface";
import { IDashboardTotalRepository } from "@/modules/dashboard-totals/dashboard-total-repository-interface";
import { IAnnouncementRepository } from "@/modules/announcements/announcement-repository-interface";
import { IUserLogsRepository } from "@/modules/user-logs/user-logs-repository-interface";
import { IOriginRepository } from "@/modules/origins/origin-repository-interface";
import { IBuyHistoryRepository } from "@/modules/buy-history/buy-history-repository-interface";
import { ICommodityRepository } from "@/modules/commodity/commodity-repository-interface";
import { IStockAssetRepository } from "@/modules/stock-assets/stock-asset-repository-interface";
import { ISellHistoryRepository } from "@/modules/sell-history/sell-history-repository-interface";
import { IAuditLogsRepository } from "@/modules/audit-logs/audit-logs-repository-interface";

// Import Repository
import { RoleRepository } from "@/modules/roles/role-repository";
import { UserRepository } from "@/modules/users/user-repository";
import { RefreshTokenRepository } from "@/modules/refresh-tokens/refresh-token-repository";
import { DashboardTotalRepository } from "@/modules/dashboard-totals/dashboard-total-repository";
import { AnnouncementRepository } from "@/modules/announcements/announcement-repository";
import { UserLogsRepository } from "@/modules/user-logs/user-logs-repository";
import { OriginRepository } from "@/modules/origins/origin-repository";
import { BuyHistoryRepository } from "@/modules/buy-history/buy-history-repository";
import { CommodityRepository } from "@/modules/commodity/commodity-repository";
import { StockAssetRepository } from "@/modules/stock-assets/stock-asset-repository";
import { SellHistoryRepository } from "@/modules/sell-history/sell-history-repository";
import { AuditLogsRepository } from "@/modules/audit-logs/audit-logs-repository";

//
const container = new Container();

// bootstrap / kernel / libs
container.bind<IServer>(TYPES.Server).to(Server).inSingletonScope();
container.bind<Bootstrap>(TYPES.Bootstrap).to(Bootstrap).inSingletonScope();
container.bind<Cron>(Cron).toSelf().inSingletonScope();

// Routes
container.bind<Routes>(Routes).toSelf().inSingletonScope();
container.bind<WebAuthRoutes>(WebAuthRoutes).toSelf().inSingletonScope();
container.bind<UserRoutes>(UserRoutes).toSelf().inSingletonScope();
container.bind<RoleRoutes>(RoleRoutes).toSelf().inSingletonScope();
container.bind<AnnouncementRoutes>(AnnouncementRoutes).toSelf().inSingletonScope();
container.bind<OriginRoutes>(OriginRoutes).toSelf().inSingletonScope();
container.bind<BuyHistoryRoutes>(BuyHistoryRoutes).toSelf().inSingletonScope();
container.bind<CommodityRoutes>(CommodityRoutes).toSelf().inSingletonScope();
container.bind<SellHistoryRoutes>(SellHistoryRoutes).toSelf().inSingletonScope();
container.bind<StockAssetRoutes>(StockAssetRoutes).toSelf().inSingletonScope();
container.bind<AuditLogsRoutes>(AuditLogsRoutes).toSelf().inSingletonScope();
container.bind<BackUpRoutes>(BackUpRoutes).toSelf().inSingletonScope();

// Middleware
container.bind(AuthMiddleware).toSelf();

// Controllers
container.bind(WebAuthController).toSelf();
container.bind(RoleController).toSelf();
container.bind(UserController).toSelf();
container.bind(AnnouncementController).toSelf();
container.bind(OriginController).toSelf();
container.bind(BuyHistoryController).toSelf();
container.bind(CommodityController).toSelf();
container.bind(SellHistoryController).toSelf();
container.bind(StockAssetController).toSelf();
container.bind(AuditLogsController).toSelf();
container.bind(BackUpController).toSelf();

// Services
container.bind<BackgroundServiceManager>(TYPES.BackgroundServiceManager).to(BackgroundServiceManager);
container.bind(TYPES.WebAuthService).to(WebAuthService);
container.bind(TYPES.RoleService).to(RoleService);
container.bind(TYPES.UserService).to(UserService);
container.bind(TYPES.RefreshTokenService).to(RefreshTokenService);
container.bind(TYPES.DashboardTotalService).to(DashboardTotalService);
container.bind(TYPES.AnnouncementService).to(AnnouncementService);
container.bind(TYPES.UserLogsService).to(UserLogsService);
container.bind(TYPES.ManageDbTransactionService).to(ManageDbTransactionService);
container.bind(TYPES.OriginService).to(OriginService);
container.bind(TYPES.BuyHistoryService).to(BuyHistoryService);
container.bind(TYPES.CommodityService).to(CommodityService);
container.bind(TYPES.SellHistoryService).to(SellHistoryService);
container.bind(TYPES.StockAssetService).to(StockAssetService);
container.bind(TYPES.AuditLogsService).to(AuditLogsService);
container.bind(TYPES.BackUpService).to(BackUpService);

// Repository
container
  .bind<IRoleRepository>(TYPES.IRoleRepository)
  .to(RoleRepository);
container
  .bind<IUserRepository>(TYPES.IUserRepository)
  .to(UserRepository);
container
  .bind<IRefreshTokenRepository>(TYPES.IRefreshTokenRepository)
  .to(RefreshTokenRepository);
container
  .bind<IDashboardTotalRepository>(TYPES.IDashboardTotalRepository)
  .to(DashboardTotalRepository);
container
  .bind<IAnnouncementRepository>(TYPES.IAnnouncementRepository)
  .to(AnnouncementRepository);
container
  .bind<IUserLogsRepository>(TYPES.IUserLogsRepository)
  .to(UserLogsRepository);
container
  .bind<IOriginRepository>(TYPES.IOriginRepository)
  .to(OriginRepository);
container
  .bind<IBuyHistoryRepository>(TYPES.IBuyHistoryRepository)
  .to(BuyHistoryRepository);
container
  .bind<ICommodityRepository>(TYPES.ICommodityRepository)
  .to(CommodityRepository);
container
  .bind<IStockAssetRepository>(TYPES.IStockAssetRepository)
  .to(StockAssetRepository);
container
  .bind<ISellHistoryRepository>(TYPES.ISellHistoryRepository)
  .to(SellHistoryRepository);
container
  .bind<IAuditLogsRepository>(TYPES.IAuditLogsRepository)
  .to(AuditLogsRepository);

export default container;
