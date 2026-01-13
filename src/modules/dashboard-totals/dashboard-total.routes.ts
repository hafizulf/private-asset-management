import { injectable } from "inversify"
import container from "@/container"
import { DashboardTotalController } from "./dashboard-total-controller"
import { AuthMiddleware } from "@/presentation/middlewares/auth-middleware"
import { Router } from "express"
import { SUPERADMIN } from "../common/const/role-constants"
import asyncWrap from "../common/asyncWrapper"

@injectable()
export class DashboardTotalRoutes {
  public routes = '/dashboard'
  controller = container.get<DashboardTotalController>(DashboardTotalController)
  AuthMiddleware = container.get<AuthMiddleware>(AuthMiddleware)

  public setRoutes(router: Router) {
    router.get(
      `${this.routes}/profit-loss`,
      this.AuthMiddleware.authenticate,
      this.AuthMiddleware.roleAuthorize([SUPERADMIN]),
      asyncWrap(this.controller.getProfitLoss)
    )
    router.get(
      `${this.routes}/stock-assets`,
      this.AuthMiddleware.authenticate,
      this.AuthMiddleware.roleAuthorize([SUPERADMIN]),
      asyncWrap(this.controller.getStockAssets)
    )
    router.get(
      `${this.routes}/buy-transactions`,
      this.AuthMiddleware.authenticate,
      this.AuthMiddleware.roleAuthorize([SUPERADMIN]),
      asyncWrap(this.controller.getBuyTransactions)
    )
    router.get(
      `${this.routes}/sell-transactions`,
      this.AuthMiddleware.authenticate,
      this.AuthMiddleware.roleAuthorize([SUPERADMIN]),
      asyncWrap(this.controller.getSellTransactions)
    )
    router.get(
      `${this.routes}/buy-sell-series`,
      this.AuthMiddleware.authenticate,
      this.AuthMiddleware.roleAuthorize([SUPERADMIN]),
      asyncWrap(this.controller.getBuySellSeries)
    )
    router.get(
      `${this.routes}/top-commodities`,
      this.AuthMiddleware.authenticate,
      this.AuthMiddleware.roleAuthorize([SUPERADMIN]),
      asyncWrap(this.controller.getTopCommodities),
    )
    router.get(
      `${this.routes}/recent-transactions`,
      this.AuthMiddleware.authenticate,
      this.AuthMiddleware.roleAuthorize([SUPERADMIN]),
      asyncWrap(this.controller.getRecentTransactions),
    )
  }
}
