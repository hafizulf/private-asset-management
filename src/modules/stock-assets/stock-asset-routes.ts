import { AuthMiddleware } from "@/presentation/middlewares/auth-middleware";
import { Router } from "express";
import { injectable } from "inversify";
import asyncWrap from "../common/asyncWrapper";
import container from "@/container";
import { StockAssetController } from "./stock-asset-controller";

@injectable()
export class StockAssetRoutes { 
  public routes = '/stock-assets';
  controller = container.get<StockAssetController>(StockAssetController);
  AuthMiddleware = container.get<AuthMiddleware>(AuthMiddleware);

  public setRoutes(router: Router) {
    router.get(
      `${this.routes}/commodities/:commodityId`,
      // this.AuthMiddleware.authenticate,
      // this.AuthMiddleware.roleAuthorize([SUPERADMIN, ADMIN]),
      asyncWrap(this.controller.findAllByCommodity)
    )
    router.get(
      this.routes,
      // this.AuthMiddleware.authenticate,
      // this.AuthMiddleware.roleAuthorize([SUPERADMIN, ADMIN]),
      asyncWrap(this.controller.findAll)
    )
  }
}
