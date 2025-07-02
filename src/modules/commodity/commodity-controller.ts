import { HttpCode } from "@/exceptions/app-error";
import TYPES from "@/types";
import { inject, injectable } from "inversify";
import { Request, Response } from "express";
import { StandardResponse } from "@/libs/standard-response";
import { validateSchema } from "@/helpers/schema-validator";
import { createCommoditySchema } from "./commodity-validation";
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
      message: "Buy history created successfully",
      status: HttpCode.RESOURCE_CREATED,
      data,
    }).send();
  }
}