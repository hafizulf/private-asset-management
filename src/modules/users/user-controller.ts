import { HttpCode } from "@/exceptions/app-error";
import { StandardResponse } from "@/libs/standard-response";
import { inject, injectable } from "inversify";
import TYPES from "@/types";
import { Request, Response } from "express";
import {
  changePasswordSchema,
  createUserSchema,
  deleteUserSchema,
  findByIdUserSchema,
  paginatedUsersSchema,
  resetPasswordSchema,
  updateUserSchema
} from "./user-validation";
import { UserService } from "./user-service";
import { IAuthRequest } from "@/presentation/middlewares/auth-interface";
import { validateSchema } from "@/helpers/schema-validator";

@injectable()
export class UserController {
  constructor(
    @inject(TYPES.UserService) private _service: UserService,
  ) {}

  public findAll = async (req: Request, res: Response): Promise<Response> => {
    const validatedReq = validateSchema(paginatedUsersSchema, req.query);
    const [users, pagination] = await this._service.findAll(validatedReq);

    return StandardResponse.create(res).setResponse({
      message: "Users fetched successfully",
      status: HttpCode.OK,
      data: users,
    }).withPagination(pagination?.omitProperties("offset")).send();
  }

  public store = async (req: Request, res: Response): Promise<Response> => {
    const validatedReq = validateSchema(createUserSchema, {
      ...req.body,
      avatarPath: req.file
    });
    const user = await this._service.store({
      updatedBy: "unknown",
      ...validatedReq
    });

    return StandardResponse.create(res).setResponse({
      message: "User created successfully",
      status: HttpCode.RESOURCE_CREATED,
      data: user,
    }).send();
  }

  public findById = async (req: Request, res: Response): Promise<Response> => {
    const validatedReq = validateSchema(findByIdUserSchema, req.params);
    const data = await this._service.findById(validatedReq.id);

    return StandardResponse.create(res).setResponse({
      message: "User fetched successfully",
      status: HttpCode.OK,
      data,
    }).send();
  }

  public update = async (req: IAuthRequest, res: Response): Promise<Response> => {
    const validatedReq = validateSchema(updateUserSchema, {
      ...req.params,
      ...req.body,
      avatarPath: req.file,
    });
    const result = await this._service.update({
      updatedBy: req.authUser.user.id,
      ...validatedReq
    });

    return StandardResponse.create(res).setResponse({
      message: "User updated successfully",
      status: HttpCode.OK,
      data: result
    }).send();
  }

  public delete = async (req: Request, res: Response): Promise<Response> => {
    const validatedReq = validateSchema(deleteUserSchema, req.params);
    await this._service.destroy(validatedReq.id);

    return StandardResponse.create(res).setResponse({
      message: "User deleted successfully",
      status: HttpCode.OK,
    }).send();
  }

  public changePassword = async (req: IAuthRequest, res: Response): Promise<Response> => {
    const validatedReq = validateSchema(changePasswordSchema, req.body);
    await this._service.changePassword({
      updatedBy: req.authUser.user.fullName,
      ...validatedReq
    });

    return StandardResponse.create(res).setResponse({
      message: "Password changed successfully",
      status: HttpCode.OK,
    }).send();
  }

  public resetPassword = async (req: IAuthRequest, res: Response): Promise<Response> => {
    const validatedReq = validateSchema(resetPasswordSchema, req.body);
    const data = await this._service.resetPassword(validatedReq.id, req.authUser.user.id);

    return StandardResponse.create(res).setResponse({
      message: "New password generated successfully",
      status: HttpCode.OK,
      data,
    }).send();
  }
}
