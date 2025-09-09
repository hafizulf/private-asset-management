import TYPES from "@/types";
import { inject, injectable } from "inversify";
import { TStandardPaginateOption } from "../common/dto/pagination-dto";
import { IUser, UserDomain } from "./user-domain";
import { Pagination } from "../common/pagination";
import { IUserRepository } from "./user-repository-interface";
import { FileSystem } from "@/libs/file-system";
import { IMulterFile } from "../common/interfaces/multer-interface";
import { AppError, HttpCode } from "@/exceptions/app-error";
import { TParamsChangePassword } from "./user-dto";
import { ManageDbTransactionService } from "../common/services/manage-db-transaction-service";
import { Transaction as DbTransaction } from "sequelize";
import { IUserLogsRepository } from "../user-logs/user-logs-repository-interface";

@injectable()
export class UserService {
  constructor(
    @inject(TYPES.IUserRepository)
    private _repository: IUserRepository,
    @inject(TYPES.IUserLogsRepository)
    private _userLogsRepository: IUserLogsRepository,
    @inject(TYPES.ManageDbTransactionService)
    private _dbTransactionService: ManageDbTransactionService,
  ) {}

  public async findAll(
    paginateOption?: TStandardPaginateOption
  ): Promise<[IUser[], Pagination?]> {
    if(
      paginateOption?.search ||
      (paginateOption?.page && paginateOption?.limit)
    ) {
      const pagination = Pagination.create({
        page: <number>paginateOption.page,
        limit: <number>paginateOption.limit,
      })
      const [data, paginateResult] = await this._repository.findAllWithPagination(paginateOption, pagination);
      console.log(data);
      return [this._transformUsers(data), paginateResult];
    }

    return [this._transformUsers(await this._repository.findAll())];
  }

  private _transformUsers = (users: UserDomain[]) => {
    return users.map((el) => {
      const { password, role, tokenVersion, ...restData } = el.unmarshal();
      return {
        roleName: role?.name,
        ...restData,
      }
    });
  }

  public async store(props: IUser): Promise<Omit<IUser, "password">> {
    return await this._dbTransactionService.handle(
      async (transaction: DbTransaction) => {
        const userData = UserDomain.create(props);
        userData.password = props.password; // trigger setter to hash password

        if(typeof props.avatarPath === "object") {
          const avatarPath = FileSystem.getPath(props.avatarPath, "user/avatars");
          userData.avatarPath = avatarPath;
        } else {
          userData.avatarPath = props.avatarPath || "";
        }

        const safeProps = {
          ...props,
          avatarPath: userData.avatarPath,
          password: userData.password!,
        };

        const user = await this._repository.store(safeProps, { transaction });
        if(typeof props.avatarPath === "object") {
          // store avatar after user created successfully
          FileSystem.store(props.avatarPath, "user/avatars");
        }

        // storing logs for user created
        await this._userLogsRepository.store({
          description: `User ${user.id} has been created`,
          createdBy: props.updatedBy,
        }, { transaction })

        const { password, ...restData } = user.unmarshal();
        return restData;
      },
      "Failed to create user",
      {
        onSuccess: () => {
          console.log("User created successfully");
        }
      }
    )
  }

  public async findById(id: string): Promise<IUser> {
    return (await this._repository.findById(id)).unmarshal();
  }

  public findWithRoleByUserId = async (id: string): Promise<IUser> => {
    return (await this._repository.findWithRoleByUserId(id)).unmarshal();
  }

  public async update(props: Omit<IUser, "password">): Promise<Omit<IUser, "password">> {
    try {
      const userData = await this._repository.findById(props.id!);
      const reqAvatarPath = props.avatarPath;

      if(typeof props.avatarPath === "object") {
        const avatarPath = FileSystem.getPath(props.avatarPath, "user/avatars");
        props.avatarPath = avatarPath;
      }

      const updatedUser = await this._repository.update(userData.id, props);
      // if user updated successfully && avatar uploaded, update avatar
      if(typeof reqAvatarPath === "object") {
        FileSystem.update(<IMulterFile>reqAvatarPath, "user/avatars", <string>userData.avatarPath);
      }

      const { password, role, ...restData } = updatedUser.unmarshal();
      return restData;
    } catch (error: Error | any) {
      console.error("Error updating user:", error);

      throw new AppError({
        statusCode: HttpCode.INTERNAL_SERVER_ERROR,
        description: "An error occurred while updating the user.",
        error: error.message,
      });
    }
  }

  public async destroy(id: string): Promise<boolean> {
    const deletedUserData = (await this._repository.delete(id)).unmarshal();

    if(deletedUserData.avatarPath) {
      FileSystem.destroy(<string>deletedUserData.avatarPath);
    }
    return true;
  }

  public async changePassword(params: TParamsChangePassword): Promise<boolean> {
    const {
      id,
      oldPassword,
      newPassword,
      updatedBy,
    } = params;

    const user = await this._repository.findById(id);
    const isVerified = user.verifyPassword(oldPassword);
    if(!isVerified) {
      throw new AppError({
        statusCode: HttpCode.UNAUTHORIZED,
        description: "Old password is incorrect",
      });
    }

    /*
      set new password and...
      reuse verifyPassword to compare old password with new password
    */
    user.password = newPassword;
    const isSamePassword = user.verifyPassword(oldPassword);
    if (isSamePassword) {
      throw new AppError({
        statusCode: HttpCode.BAD_REQUEST,
        description: "New password must be different from the old password",
      });
    }

    user.updatedBy = updatedBy;
    await this._repository.updatePassword({
      id,
      password: user.password,
      updatedBy: user.updatedBy
    })

    return true;
  }

  public async resetPassword(id: string, updatedBy: string): Promise<Record<string, string>> {
    const user = await this._repository.findById(id);
    const newPassword = user.generateRandomPassword();
    user.password = newPassword;
    user.updatedBy = updatedBy;

    await this._repository.updatePassword({
      id,
      password: user.password,
      updatedBy: user.updatedBy
    })

    return {
      password: newPassword,
    };
  }
}
