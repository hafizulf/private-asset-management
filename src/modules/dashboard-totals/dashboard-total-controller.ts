import TYPES from "@/types";
import { inject, injectable } from "inversify";
import { DashboardTotalService } from "./dashboard-total-service";
import { validateSchema } from "@/helpers/schema-validator";
import { getProfitLossSchema, getStockAssetsSchema } from "./dashboard-total.validation";
import { Request, Response } from "express";
import { StandardResponse } from "@/libs/standard-response";
import { HttpCode } from "@/exceptions/app-error";

@injectable()
export class DashboardTotalController {
  constructor(
    @inject(TYPES.DashboardTotalService) private _service: DashboardTotalService,
  ) {}

  public getProfitLoss = async (req: Request, res: Response): Promise<Response> => {
    const validatedReq = validateSchema(getProfitLossSchema, req.query);
    const data = await this._service.totalProfitLoss({
      filter: validatedReq.filter,
      from: validatedReq.from,
      to: validatedReq.to,
    });

    return StandardResponse.create(res).setResponse({
      message: "Dashboard total profit lost fetched successfully",
      status: HttpCode.OK,
      data,
    }).send();
  }

  public getStockAssets = async (req: Request, res: Response): Promise<Response> => {
    const validatedReq = validateSchema(getStockAssetsSchema, req.query);
    const data = await this._service.totalStockAssets(validatedReq.commodity || undefined);

    return StandardResponse.create(res).setResponse({
      message: "Dashboard total stock assets fetched successfully",
      status: HttpCode.OK,
      data,
    }).send();
  }
}
