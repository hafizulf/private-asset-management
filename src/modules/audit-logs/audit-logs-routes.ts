import container from "@/container";
import { AuthMiddleware } from "@/presentation/middlewares/auth-middleware";
import { Router } from "express";
import { injectable } from "inversify";
import { SUPERADMIN } from "../common/const/role-constants";
import asyncWrap from "../common/asyncWrapper";
import { AuditLogsController } from "./audit-logs-controller";

@injectable()
export class AuditLogsRoutes {
  public routes = '/audit-logs';
  controller = container.get<AuditLogsController>(AuditLogsController);
  AuthMiddleware = container.get<AuthMiddleware>(AuthMiddleware);

  public setRoutes(router: Router) {
    router.get(
      this.routes,
      this.AuthMiddleware.authenticate,
      this.AuthMiddleware.roleAuthorize([SUPERADMIN]),
      asyncWrap(this.controller.findAll)
    )
  }
}
