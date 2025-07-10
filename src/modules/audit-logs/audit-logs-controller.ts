import { HttpCode } from "@/exceptions/app-error";
import { validateSchema } from "@/helpers/schema-validator";
import { StandardResponse } from "@/libs/standard-response";
import TYPES from "@/types";
import { inject, injectable } from "inversify";
import { Request, Response } from "express";
import { paginatedAuditLogsSchema } from "./audit-logs-validation";
import { AuditLogsService } from "./audit-logs-service";

@injectable()
export class AuditLogsController {
  constructor(
    @inject(TYPES.AuditLogsService) private _service: AuditLogsService,
  ) {}

  public findAll = async (req: Request, res: Response): Promise<Response> => {
    const validatedReq = validateSchema(paginatedAuditLogsSchema, req.query);
    const [data, pagination] = await this._service.findAll(validatedReq);

    return StandardResponse.create(res).setResponse({
      message: "Audit logs fetched successfully",
      status: HttpCode.OK,
      data,
    }).withPagination(pagination?.omitProperties("offset")).send();
  }
}
