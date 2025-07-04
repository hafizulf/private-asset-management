import { HttpCode } from "@/exceptions/app-error";
import TYPES from "@/types";
import { inject, injectable } from "inversify";
import { Request, Response } from "express";
import { 
  createBuyHistorySchema, 
  deleteBuyHistorySchema, 
  findHistoryByCommoditySchema, 
  findOneBuyHistorySchema, 
  paginatedBuyHistorySchema, 
  updateBuyHistorySchema 
} from "./buy-history-validation";
import { StandardResponse } from "@/libs/standard-response";
import { validateSchema } from "@/helpers/schema-validator";
import { BuyHistoryService } from "./buy-history-service";

@injectable()
export class BuyHistoryController {
  constructor(
    @inject(TYPES.BuyHistoryService) private _service: BuyHistoryService,
  ) {}

  public store = async (req: Request, res: Response): Promise<Response> => {
    const validatedReq = validateSchema(createBuyHistorySchema, req.body);
    const data = await this._service.store(validatedReq);

    return StandardResponse.create(res).setResponse({
      message: "Buy history created successfully",
      status: HttpCode.RESOURCE_CREATED,
      data,
    }).send();
  }

  public findAll = async (req: Request, res: Response): Promise<Response> => {
    const validatedReq = validateSchema(paginatedBuyHistorySchema, req.query);
    const [data, pagination] = await this._service.findAll(validatedReq);

    return StandardResponse.create(res).setResponse({
      message: "Buy histories fetched successfully",
      status: HttpCode.OK,
      data,
    }).withPagination(pagination?.omitProperties("offset")).send();
  }

  public findOne = async (req: Request, res: Response): Promise<Response> => {
    const validatedReq = validateSchema(findOneBuyHistorySchema, req.params);
    const data = await this._service.findOne(validatedReq.id);

    return StandardResponse.create(res).setResponse({
      message: "Buy history fetched successfully",
      status: HttpCode.OK,
      data,
    }).send();
  }

  public findHistoryByCommodity = async (req: Request, res: Response): Promise<Response> => {
    const validatedReq = validateSchema(findHistoryByCommoditySchema, req.params);
    const data = await this._service.findByCommodity(validatedReq.commodityId);

    return StandardResponse.create(res).setResponse({
      message: "Commodity buy history fetched successfully",
      status: HttpCode.OK,
      data,
    }).send();
  }

  public update = async (req: Request, res: Response): Promise<Response> => {
    const validatedReq = validateSchema(updateBuyHistorySchema, { ...req.params, ...req.body });
    const { id, ...updateData } = validatedReq;
    const data = await this._service.update(id, updateData);

    return StandardResponse.create(res).setResponse({
      message: "Buy history updated successfully",
      status: HttpCode.OK,
      data,
    }).send();
  }

  public delete = async (req: Request, res: Response): Promise<Response> => {
    const validatedReq = validateSchema(deleteBuyHistorySchema, req.params);
    await this._service.delete(validatedReq.id);

    return StandardResponse.create(res).setResponse({
      message: "Buy history deleted successfully",
      status: HttpCode.OK,
    }).send();
  }
}
