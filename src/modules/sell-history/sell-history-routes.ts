import container from "@/container"
import { AuthMiddleware } from "@/presentation/middlewares/auth-middleware"
import { Router } from "express"
// import { ADMIN, SUPERADMIN } from "../common/const/role-constants"
import asyncWrap from "../common/asyncWrapper"
import { SellHistoryController } from "./sell-history-controller"
import { injectable } from "inversify"

@injectable()
export class SellHistoryRoutes {
  public routes = '/sell-histories'
  controller = container.get<SellHistoryController>(SellHistoryController)
  AuthMiddleware = container.get<AuthMiddleware>(AuthMiddleware)

  public setRoutes(router: Router) {
    router.post(
      this.routes,
      // this.AuthMiddleware.authenticate,
      // this.AuthMiddleware.roleAuthorize([SUPERADMIN, ADMIN]),
      asyncWrap(this.controller.store)
    )
    router.get(
      `${this.routes}/commodity/:commodityId`,
      // this.AuthMiddleware.authenticate,
      // this.AuthMiddleware.roleAuthorize([SUPERADMIN, ADMIN]),
      asyncWrap(this.controller.findHistoryByCommodity)
    )
    router.get(
      `${this.routes}/:id`,
      // this.AuthMiddleware.authenticate,
      // this.AuthMiddleware.roleAuthorize([SUPERADMIN, ADMIN]),
      asyncWrap(this.controller.findOne)
    )
    router.get(
      this.routes,
      // this.AuthMiddleware.authenticate,
      // this.AuthMiddleware.roleAuthorize([SUPERADMIN, ADMIN]),
      asyncWrap(this.controller.findAll)
    )
    router.put(
      `${this.routes}/:id`,
      // this.AuthMiddleware.authenticate,
      // this.AuthMiddleware.roleAuthorize([SUPERADMIN, ADMIN]),
      asyncWrap(this.controller.update)
    )
    router.delete(
      `${this.routes}/:id`,
      // this.AuthMiddleware.authenticate,
      // this.AuthMiddleware.roleAuthorize([SUPERADMIN, ADMIN]),
      asyncWrap(this.controller.delete)
    )
  }
}