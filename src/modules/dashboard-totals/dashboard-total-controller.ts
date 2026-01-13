import TYPES from "@/types";
import { inject, injectable } from "inversify";
import { DashboardTotalService } from "./dashboard-total-service";
import { validateSchema } from "@/helpers/schema-validator";
import { 
  getBuySellSeriesSchema,
  getBuyTransactionsSchema, 
  getProfitLossSchema, 
  getSellTransactionsSchema, 
  getStockAssetsSchema, 
  getTopCommoditiesSchema,
} from "./dashboard-total.validation";
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

  public getBuyTransactions = async (req: Request, res: Response): Promise<Response> => {
    const validatedReq = validateSchema(getBuyTransactionsSchema, req.query);
    const data = await this._service.totalBuyTransactions({
      filter: validatedReq.filter,
      from: validatedReq.from,
      to: validatedReq.to,
    });

    return StandardResponse.create(res).setResponse({
      message: "Dashboard total buy transactions fetched successfully",
      status: HttpCode.OK,
      data,
    }).send();
  }

  public getSellTransactions = async (req: Request, res: Response): Promise<Response> => {
    const validatedReq = validateSchema(getSellTransactionsSchema, req.query);
    const data = await this._service.totalSellTransactions({
      filter: validatedReq.filter,
      from: validatedReq.from,
      to: validatedReq.to,
    });

    return StandardResponse.create(res).setResponse({
      message: "Dashboard total sell transactions fetched successfully",
      status: HttpCode.OK,
      data,
    }).send();
  }

  public getBuySellSeries = async (req: Request, res: Response): Promise<Response> => {
    const validatedReq = validateSchema(getBuySellSeriesSchema, req.query);
    const data = await this._service.totalBuySellSeries(
      { filter: validatedReq.filter, from: validatedReq.from, to: validatedReq.to },
      validatedReq.granularity,
      validatedReq.metric,
    );

    return StandardResponse.create(res).setResponse({
      message: "Dashboard buy and sell series fetched successfully",
      status: HttpCode.OK,
      data,
    }).send();
  }

  public getTopCommodities = async (req: Request, res: Response): Promise<Response> => {
    const validatedReq = validateSchema(getTopCommoditiesSchema, req.query);
    const data = await this._service.totalTopCommodities(
      { filter: validatedReq.filter, from: validatedReq.from, to: validatedReq.to },
      validatedReq.metric,
      validatedReq.limit,
    );

    return StandardResponse.create(res).setResponse({
      message: "Dashboard top commodities fetched successfully",
      status: HttpCode.OK,
      data,
    }).send();
  }

  public getRecentTransactions = async (_req: Request, res: Response): Promise<Response> => {
    const data = await this._service.getRecentTransactions();

    return StandardResponse.create(res).setResponse({
      message: "Dashboard recent transactions fetched successfully",
      status: HttpCode.OK,
      data,
    }).send();
  }
}
