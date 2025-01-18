import "reflect-metadata";
import { Container } from "inversify";
import TYPES from "./types";

// Import Bootstrap / kernel / libs
import { IServer, Server } from "@/presentation/server";
import { Bootstrap } from "@/presentation/bootstrap";
import { Cron } from "@/libs/cron-job/cron";
import { SocketIO } from "@/libs/websocket";

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
import { MqttService } from "@/modules/common/services/mqtt-service";
import { MenuService } from "@/modules/access-managements/menus/menu-service";
import { PermissionService } from "@/modules/access-managements/permissions/permission-service";
import { MenuPermissionService } from "@/modules/access-managements/menu-permissions/menu-permission-service";
import { RoleMenuPermissionService } from "@/modules/access-managements/role-menu-permissions/role-menu-permission-service";

// Import Interface Repository
import { IRoleRepository } from "@/modules/roles/role-repository-interface";
import { IUserRepository } from "@/modules/users/user-repository-interface";
import { IRefreshTokenRepositoryInterface } from "@/modules/refresh-tokens/refresh-token-repository-interface";
import { IDashboardTotalRepository } from "@/modules/dashboard-totals/dashboard-total-repository-interface";
import { IAnnouncementRepository } from "@/modules/announcements/announcement-repository-interface";
import { IUserLogsRepository } from "@/modules/user-logs/user-logs-repository-interface";
import { IMenuRepository } from "@/modules/access-managements/menus/menu-repository-interface";
import { IPermissionRepository } from "@/modules/access-managements/permissions/permission-repository-interface";
import { IMenuPermissionRepository } from "@/modules/access-managements/menu-permissions/menu-permission-repository-interface";
import { IRoleMenuPermissionRepository } from "@/modules/access-managements/role-menu-permissions/role-menu-permission-repository-interface";

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

// Import Socket Namespace
import { NamespaceConfigService } from "@/libs/websocket/namespaces/namespace-config-service";
import { DashboardTotalNamespace } from "@/libs/websocket/namespaces/dashboard-total-namespace";
import { AnnouncementNamespace } from "@/libs/websocket/namespaces/announcement-namespace";
// Import Socket Middleware
import { SocketAuthenticationMiddleware } from "@/libs/websocket/middlewares/socket-authentication-middleware";
import { SocketAuthorizationMiddleware } from "@/libs/websocket/middlewares/socket-authorization-middleware";
import { SocketEventWhitelistMiddleware } from "@/libs/websocket/middlewares/socket-event-whitelist-middleware";
// Import Mqtt
import { Mqtt } from "@/libs/mqtt/mqtt-index";
import { MachineTsBoiler1Subscriber } from "./libs/mqtt/subscribers/machine-ts-boiler1-subscriber";

//
const container = new Container();

// bootstrap / kernel / libs
container.bind<IServer>(TYPES.Server).to(Server).inSingletonScope();
container.bind<Bootstrap>(TYPES.Bootstrap).to(Bootstrap).inSingletonScope();
container.bind<Cron>(Cron).toSelf().inSingletonScope();
container.bind<SocketIO>(TYPES.SocketIO).to(SocketIO).inSingletonScope();
container.bind<Mqtt>(Mqtt).toSelf().inSingletonScope();

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
container.bind(TYPES.MqttService).to(MqttService).inSingletonScope();

// Repository
container
  .bind<IRoleRepository>(TYPES.IRoleRepository)
  .to(RoleRepository);
container
  .bind<IUserRepository>(TYPES.IUserRepository)
  .to(UserRepository);
container
  .bind<IRefreshTokenRepositoryInterface>(TYPES.IRefreshTokenRepository)
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

// Socket Namespace
container
  .bind<NamespaceConfigService>(TYPES.NamespaceConfigService)
  .to(NamespaceConfigService)
  .inSingletonScope();
container
  .bind<DashboardTotalNamespace>(TYPES.DashboardTotalNamespace)
  .to(DashboardTotalNamespace);
container
  .bind<AnnouncementNamespace>(TYPES.AnnouncementNamespace)
  .to(AnnouncementNamespace);
// Socket Middleware
container
  .bind<SocketAuthenticationMiddleware>(TYPES.SocketAuthenticationMiddleware)
  .to(SocketAuthenticationMiddleware);
container
  .bind<SocketAuthorizationMiddleware>(TYPES.SocketAuthorizationMiddleware)
  .to(SocketAuthorizationMiddleware);
container
  .bind<SocketEventWhitelistMiddleware>(TYPES.SocketEventWhitelistMiddleware)
  .to(SocketEventWhitelistMiddleware);
// MQTT
container
  .bind<MachineTsBoiler1Subscriber>(MachineTsBoiler1Subscriber)
  .toSelf().inSingletonScope();

export default container;
