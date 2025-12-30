import asyncWrap from "../common/asyncWrapper"
import { AuthMiddleware } from "@/presentation/middlewares/auth-middleware"
import { BackUpController } from "./back-up.controller"
import container from "@/container"
import { injectable } from "inversify"
import { Router } from "express"
import { SUPERADMIN } from "../common/const/role-constants"

@injectable()
export class BackUpRoutes {
  public routes = '/back-up'
  controller = container.get<BackUpController>(BackUpController)
  AuthMiddleware = container.get<AuthMiddleware>(AuthMiddleware)

  public setRoutes(router: Router) {
    router.post(
      `${this.routes}/dump-postgres-docker`,
      this.AuthMiddleware.authenticate,
      this.AuthMiddleware.roleAuthorize([SUPERADMIN]),
      asyncWrap(this.controller.dumpPostgresDocker)
    )
  }
}
