const TYPES = {
  Bootstrap: Symbol.for("Bootstrap"),
  Database: Symbol.for("Database"),
  HTTPRouter: Symbol.for("HTTPRouter"),
  Logger: Symbol.for("Logger"),
  Routes: Symbol.for("Routes"),
  Server: Symbol.for("Server"),
  SocketIO: Symbol.for("SocketIO"),

  // Service
  AnnouncementService: Symbol.for("AnnouncementService"),
  AuditLogsService: Symbol.for("AuditLogsService"),
  BackgroundServiceManager: Symbol.for("BackgroundServiceManager"),
  BuyHistoryService: Symbol.for("BuyHistoryService"),
  CommodityService: Symbol.for("CommodityService"),
  DashboardTotalService: Symbol.for("DashboardTotalService"),
  ManageDbTransactionService: Symbol.for("ManageDbTransactionService"),
  OriginService: Symbol.for("OriginService"),
  RefreshTokenService: Symbol.for("RefreshTokenService"),
  StockAssetService: Symbol.for("StockAssetService"),
  RoleService: Symbol.for("RoleService"),
  SellHistoryService: Symbol.for("SellHistoryService"),
  UserService: Symbol.for("UserService"),
  UserLogsService: Symbol.for("UserLogsService"),
  WebAuthService: Symbol.for("WebAuthService"),

  // Repository Interface
  IAnnouncementRepository: Symbol.for("IAnnouncementRepository"),
  IAuditLogsRepository: Symbol.for("IAuditLogsRepository"),
  IBuyHistoryRepository: Symbol.for("IBuyHistoryRepository"),
  ICommodityRepository: Symbol.for("ICommodityRepository"),
  IDashboardTotalRepository: Symbol.for("IDashboardTotalRepository"),
  IOriginRepository: Symbol.for("IOriginRepository"),
  IRefreshTokenRepository: Symbol.for("IRefreshTokenRepository"),
  IRoleRepository: Symbol.for("IRoleRepository"),
  ISellHistoryRepository: Symbol.for("ISellHistoryRepository"),
  IStockAssetRepository: Symbol.for("IStockAssetRepository"),
  IUserRepository: Symbol.for("IUserRepository"),
  IUserLogsRepository: Symbol.for("IUserLogsRepository"),

  // Socket Namespaces
  NamespaceConfigService: Symbol.for("NamespaceConfigService"),
  AnnouncementNamespace: Symbol.for("AnnouncementNamespace"),
  DashboardTotalNamespace: Symbol.for("DashboardTotalNamespace"),

  // Socket Middleware
  SocketAuthenticationMiddleware: Symbol.for("SocketAuthenticationMiddleware"),
  SocketAuthorizationMiddleware: Symbol.for("SocketAuthorizationMiddleware"),
  SocketEventWhitelistMiddleware: Symbol.for("SocketEventWhitelistMiddleware"),
}

export default TYPES;
