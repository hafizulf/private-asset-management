import TYPES from "@/types";
import { inject, injectable } from "inversify";
import { IDashboardTotalRepository } from "./dashboard-total-repository-interface";
import { IDashboardTotal } from "./dashboard-total-domain";
import { IUserRepository } from "../users/user-repository-interface";
import { AppError, HttpCode } from "@/exceptions/app-error";

@injectable()
export class DashboardTotalService {
  constructor(
    @inject(TYPES.IDashboardTotalRepository) private _repository: IDashboardTotalRepository,
    @inject(TYPES.IUserRepository) private _userRepository: IUserRepository,
  ) {}

  async findAll(): Promise<IDashboardTotal[]> {
    return (await this._repository.findAll()).map((el) => el.unmarshal());
  }

  async insertDashboardTotal(): Promise<void> {
    try {
      const totalUserRegistered = await this._userRepository.countRegisteredUser();
      const totalUserActive = await this._userRepository.countActiveUser();

      const data = [
        {
          name: "user_registered",
          totalCounted: totalUserRegistered,
        },
        {
          name: "user_active",
          totalCounted: totalUserActive,
        },
      ];

      for (const element of data) {
        await this._repository.createOrUpdate(element);
      }
    } catch (error) {
      console.error(error);
      throw new AppError({
        statusCode: HttpCode.INTERNAL_SERVER_ERROR,
        description: "Failed to insert dashboard total",
      })
    }
  }
}
