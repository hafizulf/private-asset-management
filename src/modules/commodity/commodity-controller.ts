import { HttpCode } from "@/exceptions/app-error";
import TYPES from "@/types";
import { inject, injectable } from "inversify";
import { Request, Response } from "express";
import { StandardResponse } from "@/libs/standard-response";
import { validateSchema } from "@/helpers/schema-validator";
import { createCommoditySchema, deleteCommoditySchema, findOneCommoditySchema, paginatedCommoditySchema, updateCommoditySchema } from "./commodity-validation";
import { CommodityService } from "./commodity-service";

@injectable()
export class CommodityController {
  constructor(
    @inject(TYPES.CommodityService) private _service: CommodityService,
  ) {}

  public store = async (req: Request, res: Response): Promise<Response> => {
    const validatedReq = validateSchema(createCommoditySchema, req.body);
    const data = await this._service.store(validatedReq);

    return StandardResponse.create(res).setResponse({
      message: "Commodity created successfully",
      status: HttpCode.RESOURCE_CREATED,
      data,
    }).send();
  }

  public findOne = async (req: Request, res: Response): Promise<Response> => {
    const validatedReq = validateSchema(findOneCommoditySchema, req.params);
    const data = await this._service.findOne(validatedReq.id);

    return StandardResponse.create(res).setResponse({
      message: "Commodity fetched successfully",
      status: HttpCode.OK,
      data,
    }).send();
  }

  public findAll = async (req: Request, res: Response): Promise<Response> => {
    const validatedReq = validateSchema(paginatedCommoditySchema, req.query);
    const [data, pagination] = await this._service.findAll(validatedReq);

    return StandardResponse.create(res)
      .setResponse({
        message: "Commodity fetched successfully",
        status: HttpCode.OK,
        data,
      })
      .withPagination(pagination?.omitProperties('offset'))
      .send();
  }

  public update = async (req: Request, res: Response): Promise<Response> => {
    const validatedReq = validateSchema(updateCommoditySchema, {
      ...req.params,
      ...req.body,
    });
    const { id, ...propsData } = validatedReq;
    const data = await this._service.update(id, propsData);

    return StandardResponse.create(res).setResponse({
      message: "Commodity updated successfully",
      status: HttpCode.OK,
      data,
    }).send();
  }

  public delete = async (req: Request, res: Response): Promise<Response> => {
    const validatedReq = validateSchema(deleteCommoditySchema, req.params);
    await this._service.delete(validatedReq.id);

    return StandardResponse.create(res).setResponse({
      message: "Commodity deleted successfully",
      status: HttpCode.OK,
    }).send();
  }
}