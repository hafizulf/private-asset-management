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
import { MenuRoutes } from "@/modules/access-managements/menus/menu-routes";
import { PermissionRoutes } from "@/modules/access-managements/permissions/permission-routes";
import { MenuPermissionRoutes } from "@/modules/access-managements/menu-permissions/menu-permission-routes";
import { RoleMenuPermissionRoutes } from "@/modules/access-managements/role-menu-permissions/role-menu-permission-routes";
import { OriginRoutes } from "@/modules/origins/origin-routes";
import { BuyHistoryRoutes } from "@/modules/buy-history/buy-history-routes";
import { CommodityRoutes } from "@/modules/commodity/commodity-routes";
import { SellHistoryRoutes } from "@/modules/sell-history/sell-history-routes";

// Import Middlewares
import { AuthMiddleware } from "@/presentation/middlewares/auth-middleware";

// Import Controllers
import { WebAuthController } from "@/modules/authentications/web-auth-controller";
import { RoleController } from "@/modules/roles/role-controller";
import { UserController } from "@/modules/users/user-controller";
import { AnnouncementController } from "@/modules/announcements/announcement-controller";
import { MenuController } from "@/modules/access-managements/menus/menu-controller";
import { PermissionController } from "@/modules/access-managements/permissions/permission-controller";
import { MenuPermissionController } from "@/modules/access-managements/menu-permissions/menu-permission-controller";
import { RoleMenuPermissionController } from "@/modules/access-managements/role-menu-permissions/role-menu-permission-controller";
import { OriginController } from "@/modules/origins/origin-controller";
import { BuyHistoryController } from "@/modules/buy-history/buy-history-controller";
import { CommodityController } from "@/modules/commodity/commodity-controller";
import { SellHistoryController } from "@/modules/sell-history/sell-history-controller";

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
import { MenuService } from "@/modules/access-managements/menus/menu-service";
import { PermissionService } from "@/modules/access-managements/permissions/permission-service";
import { MenuPermissionService } from "@/modules/access-managements/menu-permissions/menu-permission-service";
import { RoleMenuPermissionService } from "@/modules/access-managements/role-menu-permissions/role-menu-permission-service";
import { OriginService } from "@/modules/origins/origin-service";
import { BuyHistoryService } from "@/modules/buy-history/buy-history-service";
import { CommodityService } from "@/modules/commodity/commodity-service";
import { SellHistoryService } from "@/modules/sell-history/sell-history-service";

// Import Interface Repository
import { IRoleRepository } from "@/modules/roles/role-repository-interface";
import { IUserRepository } from "@/modules/users/user-repository-interface";
import { IRefreshTokenRepository } from "@/modules/refresh-tokens/refresh-token-repository-interface";
import { IDashboardTotalRepository } from "@/modules/dashboard-totals/dashboard-total-repository-interface";
import { IAnnouncementRepository } from "@/modules/announcements/announcement-repository-interface";
import { IUserLogsRepository } from "@/modules/user-logs/user-logs-repository-interface";
import { IMenuRepository } from "@/modules/access-managements/menus/menu-repository-interface";
import { IPermissionRepository } from "@/modules/access-managements/permissions/permission-repository-interface";
import { IMenuPermissionRepository } from "@/modules/access-managements/menu-permissions/menu-permission-repository-interface";
import { IRoleMenuPermissionRepository } from "@/modules/access-managements/role-menu-permissions/role-menu-permission-repository-interface";
import { IOriginRepository } from "@/modules/origins/origin-repository-interface";
import { IBuyHistoryRepository } from "@/modules/buy-history/buy-history-repository-interface";
import { ICommodityRepository } from "@/modules/commodity/commodity-repository-interface";
import { IStockAssetRepository } from "@/modules/stock-assets/stock-asset-repository-interface";
import { ISellHistoryRepository } from "@/modules/sell-history/sell-history-repository-interface";

// Import Repository
import { RoleRepository } from "@/modules/roles/role-repository";
import { UserRepository } from "@/modules/users/user-repository";
import { RefreshTokenRepository } from "@/modules/refresh-tokens/refresh-token-repository";
import { DashboardTotalRepository } from "@/modules/dashboard-totals/dashboard-total-repository";
import { AnnouncementRepository } from "@/modules/announcements/announcement-repository";
import { UserLogsRepository } from "@/modules/user-logs/user-logs-repository";
import { MenuRepository } from "@/modules/access-managements/menus/menu-repository";
import { PermissionRepository } from "@/modules/access-managements/permissions/permission-repository";
import { MenuPermissionRepository } from "@/modules/access-managements/menu-permissions/menu-permission-repository";
import { RoleMenuPermissionRepository } from "@/modules/access-managements/role-menu-permissions/role-menu-permission-repository";
import { OriginRepository } from "@/modules/origins/origin-repository";
import { BuyHistoryRepository } from "@/modules/buy-history/buy-history-repository";
import { CommodityRepository } from "@/modules/commodity/commodity-repository";
import { StockAssetRepository } from "@/modules/stock-assets/stock-asset-repository";
import { SellHistoryRepository } from "@/modules/sell-history/sell-history-repository";

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
container.bind<MenuRoutes>(MenuRoutes).toSelf().inSingletonScope();
container.bind<PermissionRoutes>(PermissionRoutes).toSelf().inSingletonScope();
container.bind<MenuPermissionRoutes>(MenuPermissionRoutes).toSelf().inSingletonScope();
container.bind<RoleMenuPermissionRoutes>(RoleMenuPermissionRoutes).toSelf().inSingletonScope();
container.bind<OriginRoutes>(OriginRoutes).toSelf().inSingletonScope();
container.bind<BuyHistoryRoutes>(BuyHistoryRoutes).toSelf().inSingletonScope();
container.bind<CommodityRoutes>(CommodityRoutes).toSelf().inSingletonScope();
container.bind<SellHistoryRoutes>(SellHistoryRoutes).toSelf().inSingletonScope();

// Middleware
container.bind(AuthMiddleware).toSelf();

// Controllers
container.bind(WebAuthController).toSelf();
container.bind(RoleController).toSelf();
container.bind(UserController).toSelf();
container.bind(AnnouncementController).toSelf();
container.bind(MenuController).toSelf();
container.bind(PermissionController).toSelf();
container.bind(MenuPermissionController).toSelf();
container.bind(RoleMenuPermissionController).toSelf();
container.bind(OriginController).toSelf();
container.bind(BuyHistoryController).toSelf();
container.bind(CommodityController).toSelf();
container.bind(SellHistoryController).toSelf();

// Services
container.bind<BackgroundServiceManager>(TYPES.BackgroundServiceManager).to(BackgroundServiceManager);
container.bind(TYPES.WebAuthService).to(WebAuthService);
container.bind(TYPES.RoleService).to(RoleService);
container.bind(TYPES.UserService).to(UserService);
container.bind(TYPES.RefreshTokenService).to(RefreshTokenService);
container.bind(TYPES.DashboardTotalService).to(DashboardTotalService);
container.bind(TYPES.AnnouncementService).to(AnnouncementService);
container.bind(TYPES.UserLogsService).to(UserLogsService);
container.bind(TYPES.MenuService).to(MenuService);
container.bind(TYPES.PermissionService).to(PermissionService);
container.bind(TYPES.MenuPermissionService).to(MenuPermissionService);
container.bind(TYPES.RoleMenuPermissionService).to(RoleMenuPermissionService);
container.bind(TYPES.ManageDbTransactionService).to(ManageDbTransactionService);
container.bind(TYPES.OriginService).to(OriginService);
container.bind(TYPES.BuyHistoryService).to(BuyHistoryService);
container.bind(TYPES.CommodityService).to(CommodityService);
container.bind(TYPES.SellHistoryService).to(SellHistoryService);

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
  .bind<IMenuRepository>(TYPES.IMenuRepository)
  .to(MenuRepository);
container
  .bind<IPermissionRepository>(TYPES.IPermissionRepository)
  .to(PermissionRepository);
container
  .bind<IMenuPermissionRepository>(TYPES.IMenuPermissionRepository)
  .to(MenuPermissionRepository);
container
  .bind<IRoleMenuPermissionRepository>(TYPES.IRoleMenuPermissionRepository)
  .to(RoleMenuPermissionRepository);
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

export default container;
