import container from "@/container"
import { AuthMiddleware } from "@/presentation/middlewares/auth-middleware"
import { Router } from "express"
// import { ADMIN, SUPERADMIN } from "../common/const/role-constants"
import asyncWrap from "../common/asyncWrapper"
import { CommodityController } from "./commodity-controller"
import { injectable } from "inversify"

@injectable()
export class CommodityRoutes {
  public routes = '/commodities'
  controller = container.get<CommodityController>(CommodityController)
  AuthMiddleware = container.get<AuthMiddleware>(AuthMiddleware)

  public setRoutes(router: Router) {
    router.post(
      this.routes,
      // this.AuthMiddleware.authenticate,
      // this.AuthMiddleware.roleAuthorize([SUPERADMIN]),
      asyncWrap(this.controller.store)
    )
  }
}