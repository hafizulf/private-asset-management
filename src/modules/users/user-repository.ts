import { injectable } from "inversify";
import { TStandardPaginateOption } from "../common/dto/pagination-dto";
import { Pagination } from "../common/pagination";
import { UserDomain, IUser } from "./user-domain";
import { IUserRepository } from "./user-repository-interface";
import { User as UserPersistence } from "@/modules/common/sequelize";
import { Role as RolePersistence } from "@/modules/common/sequelize";
import { Op, Sequelize } from "sequelize";
import { ICreateUserProps, TPropsUpdatePassword } from "./user-dto";
import { AppError, HttpCode } from "@/exceptions/app-error";
import { BaseQueryOption } from "../common/dto/common-dto";
import { RoleErrMessage, UserErrMessage } from "@/exceptions/error-message-constants";

@injectable()
export class UserRepository implements IUserRepository {
  async findAll(): Promise<UserDomain[]> {
    const users = await UserPersistence.findAll({
      attributes: {
        exclude: ["password"],
      },
      include: [
        {
          model: RolePersistence,
          attributes: ["name"],
        }
      ],
      order: [["createdAt", "DESC"]],
    });
    return users.map((el) => UserDomain.create(el.toJSON()));
  }

  async findAllWithPagination(
    paginateOption: TStandardPaginateOption,
    pagination: Pagination
  ): Promise<[UserDomain[], Pagination]> {
    const search = paginateOption.search;
    const orderBy = paginateOption.orderBy ? paginateOption.orderBy : "fullName";
    const sort = paginateOption.sort ? paginateOption.sort : "DESC";
    const searchCondition = search
      ? {
          [Op.or]: [
            {
              fullName: {
                [Op.iLike]: `%${search}%`,
              },
            },
            {
              email: {
                [Op.iLike]: `%${search}%`,
              },
            },
            Sequelize.literal(`"role"."name" ILIKE :search`),
          ],
        }
      : {};

    const { rows, count } = await UserPersistence.findAndCountAll({
      attributes: {
        exclude: ["password"],
      },
      include: [
        {
          model: RolePersistence,
          attributes: ["name"],
        }
      ],
      where: {
        ...searchCondition,
      },
      replacements: { search: `%${search}%` },
      order: [
        orderBy === "role"
          ? [Sequelize.col("role.name"), sort]
          : [Sequelize.col(orderBy), sort],
      ],
      limit: pagination.limit,
      offset: pagination.offset,
    });

    pagination.generateMeta(count, rows.length);
    return [rows.map((el) => UserDomain.create(el.toJSON())), pagination];
  }

  async store(
    props: ICreateUserProps,
    option: BaseQueryOption,
  ): Promise<UserDomain> {
    const isExistRole = await RolePersistence.findByPk(props.roleId);
    if(!isExistRole) {
      throw new AppError({
        statusCode: HttpCode.NOT_FOUND,
        description: RoleErrMessage.NOT_FOUND,
      })
    }

    try {
      const createdUser = await UserPersistence.create(props, { transaction: option.transaction });
      return UserDomain.create(createdUser.toJSON());
    } catch(e: Error | any) {
      if(e?.name === "SequelizeUniqueConstraintError") {
        throw new AppError({
          statusCode: HttpCode.CONFLICT,
          description: UserErrMessage.ALREADY_EXISTS,
        })
      }

      throw new AppError({
        statusCode: HttpCode.BAD_REQUEST,
        description: "Failed to create user",
        error: e,
      });
    }
  }
  async findById(id: string): Promise<UserDomain> {
    const isExistUser = await UserPersistence.findByPk(id);
    if(!isExistUser) {
      throw new AppError({
        statusCode: HttpCode.NOT_FOUND,
        description: UserErrMessage.NOT_FOUND,
      })
    }

    return UserDomain.create(isExistUser.toJSON());
  }
  async update(id: string, props: Omit<IUser, "password">): Promise<UserDomain> {
    const user = await UserPersistence.findByPk(id, {
      include: [{ model: RolePersistence }],
    });
    if(!user) {
      throw new AppError({
        statusCode: HttpCode.NOT_FOUND,
        description: UserErrMessage.NOT_FOUND,
      })
    }

    // check wether email already used by other user
    const isExistEmail = await UserPersistence.findOne({
      where: {
        email: props.email
      }
    })
    if(isExistEmail && isExistEmail.id !== id) {
      throw new AppError({
        statusCode: HttpCode.CONFLICT,
        description: UserErrMessage.EMAIL_ALREADY_EXISTS,
      })
    }

    // Update User
    const updateProps = {
      fullName: props.fullName,
      email: props.email,
      avatarPath: typeof props.avatarPath === "string" ? props.avatarPath : undefined,
      roleId: props.roleId,
      updatedBy: props.updatedBy,
    };

    await user.update(updateProps, {
      where: {
        id
      }
    })
    await user.reload(); // reload to get updated data
    return UserDomain.create(user.toJSON());
  }

  async delete(id: string): Promise<UserDomain> {
    const isExistUser = await UserPersistence.findByPk(id);
    if(!isExistUser) {
      throw new AppError({
        statusCode: HttpCode.NOT_FOUND,
        description: UserErrMessage.NOT_FOUND,
      })
    }

    await isExistUser.destroy();
    return UserDomain.create(isExistUser.toJSON());
  }

  async findByEmail(email: string): Promise<UserDomain> {
    const isExistUser = await UserPersistence.findOne({
      where: {
        email,
      }
    })

    if(!isExistUser) {
      throw new AppError({
        statusCode: HttpCode.NOT_FOUND,
        description: "Email not found",
      })
    }

    return UserDomain.create(isExistUser.toJSON());
  }

  async findWithRoleByUserId(id: string): Promise<UserDomain> {
    const isExistUser = await UserPersistence.findByPk(id, {
      include: [{ model: RolePersistence }],
    });
    if(!isExistUser) {
      throw new AppError({
        statusCode: HttpCode.NOT_FOUND,
        description: UserErrMessage.NOT_FOUND,
      })
    }

    return UserDomain.create(isExistUser.toJSON());
  }

  async updatePassword(props: TPropsUpdatePassword): Promise<boolean> {
    const updatedUser = await UserPersistence.update(
      {
        password: props.password,
        updatedBy: props.updatedBy,
      },
      {
        where: {
          id: props.id
        }
      }
    )

    return updatedUser[0] > 0; // return true if updated
  }

  async incrementTokenVersion(id: string): Promise<void> {
    const user = await UserPersistence.findByPk(id);

    if(!user) {
      throw new AppError({
        statusCode: HttpCode.NOT_FOUND,
        description: UserErrMessage.NOT_FOUND,
      })
    }

    await user.increment("tokenVersion");
  }

  async countRegisteredUser(): Promise<number> {
    const users = await UserPersistence.findAndCountAll({
      paranoid: false,
    });
    return users.count;
  }

  async countActiveUser(): Promise<number> {
    const users = await UserPersistence.findAndCountAll();
    return users.count;
  }
}
