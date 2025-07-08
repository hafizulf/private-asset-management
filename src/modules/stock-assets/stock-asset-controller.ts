import TYPES from "@/types";
import { inject, injectable } from "inversify";
import { StockAssetService } from "./stock-asset-service";
import { Request, Response } from "express";
import { StandardResponse } from "@/libs/standard-response";
import { HttpCode } from "@/exceptions/app-error";
import { validateSchema } from "@/helpers/schema-validator";
import { findByCommoditySchema, paginatedStockAssetSchema } from "./stock-asset-validation";

@injectable()
export class StockAssetController {
  constructor(
    @inject(TYPES.StockAssetService) private _service: StockAssetService,
  ) {}

  public findAll = async (req: Request, res: Response): Promise<Response> => {
    const validatedReq = validateSchema(paginatedStockAssetSchema, req.query);
    const [data, pagination] = await this._service.findAll(validatedReq);
  
    return StandardResponse.create(res).setResponse({
      message: "Stock assets fetched successfully",
      status: HttpCode.OK,
      data,
    }).withPagination(pagination?.omitProperties("offset")).send();
  }

  public findAllByCommodity = async (req: Request, res: Response): Promise<Response> => {
    const validatedReq = validateSchema(findByCommoditySchema, req.params);
    const data = await this._service.findAllByCommodity(validatedReq.commodityId);
  
    return StandardResponse.create(res).setResponse({
      message: "Stock assets fetched successfully",
      status: HttpCode.OK,
      data,
    }).send();
  }
}