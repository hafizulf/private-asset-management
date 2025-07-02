import { HttpCode } from "@/exceptions/app-error";
import TYPES from "@/types";
import { inject, injectable } from "inversify";
import { Request, Response } from "express";
import { createBuyHistorySchema, findHistoryByCommoditySchema, findOneBuyHistorySchema, paginatedBuyHistorySchema } from "./buy-history-validation";
import { StandardResponse } from "@/libs/standard-response";
import { validateSchema } from "@/helpers/schema-validator";
import { BuyHistoryService } from "./buy-history-service";
import { IBuyHistory } from "./buy-history-domain";

@injectable()
export class BuyHistoryController {
  constructor(
    @inject(TYPES.BuyHistoryService) private _service: BuyHistoryService,
  ) {}

  public store = async (req: Request, res: Response): Promise<Response> => {
    const validatedReq = validateSchema(createBuyHistorySchema, req.body);
    const data = await this._service.store(validatedReq as IBuyHistory);

    return StandardResponse.create(res).setResponse({
      message: "Buy history created successfully",
      status: HttpCode.RESOURCE_CREATED,
      data,
    }).send();
  }

  public findAll = async (req: Request, res: Response): Promise<Response> => {
    console.log("find all");
    const validatedReq = validateSchema(paginatedBuyHistorySchema, req.query);
    const [data, pagination] = await this._service.findAll(validatedReq);

    return StandardResponse.create(res).setResponse({
      message: "Buy histories fetched successfully",
      status: HttpCode.OK,
      data,
    }).withPagination(pagination?.omitProperties("offset")).send();
  }

  public findOne = async (req: Request, res: Response): Promise<Response> => {
    console.log("find One");
    const validatedReq = validateSchema(findOneBuyHistorySchema, req.params);
    const data = await this._service.findOne(validatedReq.id);

    return StandardResponse.create(res).setResponse({
      message: "Buy history fetched successfully",
      status: HttpCode.OK,
      data,
    }).send();
  }

  public findHistoryByCommodity = async (req: Request, res: Response): Promise<Response> => {
    console.log("masuk");
    const validatedReq = validateSchema(findHistoryByCommoditySchema, req.params);
    const data = await this._service.findByCommodity(validatedReq.commodityId);

    return StandardResponse.create(res).setResponse({
      message: "Commodity buy history fetched successfully",
      status: HttpCode.OK,
      data,
    }).send();
  }
}