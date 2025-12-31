import TYPES from "@/types";
import { inject, injectable } from "inversify";
import { BackUpService } from "./back-up.service";
import { IAuthRequest } from "@/presentation/middlewares/auth-interface";
import { Response } from "express";
import { StandardResponse } from "@/libs/standard-response";
import { HttpCode } from "@/exceptions/app-error";

@injectable()
export class BackUpController {
  constructor(
    @inject(TYPES.BackUpService) private _service: BackUpService,
  ) {}

  public dumpPostgresDocker = async (_req: IAuthRequest, res: Response): Promise<Response> => {
    const data = await this._service.dumpPostgresDocker();

    return StandardResponse.create(res).setResponse({
      message: "Backup file created successfully",
      status: HttpCode.OK,
      data,
    }).send();
  }

  public uploadToGDrive = async (_req: IAuthRequest, res: Response): Promise<Response> => {
    const FOLDER_ID = process.env.DRIVE_FOLDER_ID;
    const data = await this._service.backupAndUpload(FOLDER_ID!);

    return StandardResponse.create(res).setResponse({
      message: "Upload backup db successfully",
      status: HttpCode.OK,
      data,
    }).send();
  }
}
