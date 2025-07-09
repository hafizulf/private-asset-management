import { HttpCode } from "@/exceptions/app-error";
import TYPES from "@/types";
import { inject, injectable } from "inversify";
import { Request, Response } from "express";
import { StandardResponse } from "@/libs/standard-response";
import { validateSchema } from "@/helpers/schema-validator";
import { SellHistoryService } from "./sell-history-service";
import { 
  createSellHistorySchema, 
  deleteSellHistorySchema, 
  findOneSellHistorySchema, 
  findSellHistoryByCommoditySchema, 
  paginatedSellHistorySchema, 
  updateSellHistorySchema
} from "./sell-history-validation";
import { IAuthRequest } from "@/presentation/middlewares/auth-interface";

@injectable()
export class SellHistoryController {
  constructor(
    @inject(TYPES.SellHistoryService) private _service: SellHistoryService,
  ) {}

  public store = async (req: IAuthRequest, res: Response): Promise<Response> => {
    const validatedReq = validateSchema(createSellHistorySchema, req.body);
    const data = await this._service.store(validatedReq, req.authUser.user.id);

    return StandardResponse.create(res).setResponse({
      message: "Sell history created successfully",
      status: HttpCode.RESOURCE_CREATED,
      data,
    }).send();
  }

  public findAll = async (req: Request, res: Response): Promise<Response> => {
    const validatedReq = validateSchema(paginatedSellHistorySchema, req.query);
    const [data, pagination] = await this._service.findAll(validatedReq);

    return StandardResponse.create(res).setResponse({
      message: "Sell histories fetched successfully",
      status: HttpCode.OK,
      data,
    }).withPagination(pagination?.omitProperties("offset")).send();
  }

  public findOne = async (req: Request, res: Response): Promise<Response> => {
    const validatedReq = validateSchema(findOneSellHistorySchema, req.params);
    const data = await this._service.findOne(validatedReq.id);

    return StandardResponse.create(res).setResponse({
      message: "Sell history fetched successfully",
      status: HttpCode.OK,
      data,
    }).send();
  }

  public findHistoryByCommodity = async (req: Request, res: Response): Promise<Response> => {
    const validatedReq = validateSchema(findSellHistoryByCommoditySchema, req.params);
    const data = await this._service.findByCommodity(validatedReq.commodityId);

    return StandardResponse.create(res).setResponse({
      message: "Commodity sell history fetched successfully",
      status: HttpCode.OK,
      data,
    }).send();
  }

  public update = async (req: IAuthRequest, res: Response): Promise<Response> => {
    const validatedReq = validateSchema(updateSellHistorySchema, { ...req.params, ...req.body });
    const { id, ...updateData } = validatedReq;
    const data = await this._service.update(id, updateData, req.authUser.user.id);

    return StandardResponse.create(res).setResponse({
      message: "Sell history updated successfully",
      status: HttpCode.OK,
      data,
    }).send();
  }

  public delete = async (req: IAuthRequest, res: Response): Promise<Response> => {
    const validatedReq = validateSchema(deleteSellHistorySchema, req.params);
    await this._service.delete(validatedReq.id, req.authUser.user.id);

    return StandardResponse.create(res).setResponse({
      message: "Sell history deleted successfully",
      status: HttpCode.OK,
    }).send();
  }
}
