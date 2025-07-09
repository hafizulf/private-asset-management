import container from "@/container"
import { AuthMiddleware } from "@/presentation/middlewares/auth-middleware"
import { Router } from "express"
import asyncWrap from "../common/asyncWrapper"
import { BuyHistoryController } from "./buy-history-controller"
import { injectable } from "inversify"
import { SUPERADMIN } from "../common/const/role-constants"

@injectable()
export class BuyHistoryRoutes {
  public routes = '/buy-histories'
  controller = container.get<BuyHistoryController>(BuyHistoryController)
  AuthMiddleware = container.get<AuthMiddleware>(AuthMiddleware)

  public setRoutes(router: Router) {
    router.post(
      this.routes,
      this.AuthMiddleware.authenticate,
      this.AuthMiddleware.roleAuthorize([SUPERADMIN]),
      asyncWrap(this.controller.store)
    )
    router.get(
      `${this.routes}/commodity/:commodityId`,
      this.AuthMiddleware.authenticate,
      this.AuthMiddleware.roleAuthorize([SUPERADMIN]),
      asyncWrap(this.controller.findHistoryByCommodity)
    )
    router.get(
      `${this.routes}/:id`,
      this.AuthMiddleware.authenticate,
      this.AuthMiddleware.roleAuthorize([SUPERADMIN]),
      asyncWrap(this.controller.findOne)
    )
    router.get(
      this.routes,
      this.AuthMiddleware.authenticate,
      this.AuthMiddleware.roleAuthorize([SUPERADMIN]),
      asyncWrap(this.controller.findAll)
    )
    router.put(
      `${this.routes}/:id`,
      this.AuthMiddleware.authenticate,
      this.AuthMiddleware.roleAuthorize([SUPERADMIN]),
      asyncWrap(this.controller.update)
    )
    router.delete(
      `${this.routes}/:id`,
      this.AuthMiddleware.authenticate,
      this.AuthMiddleware.roleAuthorize([SUPERADMIN]),
      asyncWrap(this.controller.delete)
    )
  }
}