import TYPES from "@/types";
import { inject, injectable } from "inversify";
import { IAuditLogsRepository } from "./audit-logs-repository-interface";
import { TStandardPaginateOption } from "../common/dto/pagination-dto";
import { AuditLogsDomain, IAuditLogs } from "./audit-logs-domain";
import { Pagination } from "../common/pagination";

@injectable()
export class AuditLogsService {
  constructor(
    @inject(TYPES.IAuditLogsRepository) private _repository: IAuditLogsRepository,
  ) {}

  public findAll = async (
    paginateOption?: TStandardPaginateOption
  ): Promise<[IAuditLogs[], Pagination?]> => {
    if(
      paginateOption?.search ||
      (paginateOption?.page && paginateOption?.limit)
    ) {
      const pagination = Pagination.create({
        page: <number>paginateOption.page,
        limit: <number>paginateOption.limit,
      })
      const [data, paginateResult] = await this._repository.findAllWithPagination(paginateOption, pagination);
      return [this.transformData(data), paginateResult];
    }

    const data = (await this._repository.findAll());
    return [this.transformData(data)];
  }

  private transformData(data: AuditLogsDomain[]): IAuditLogs[] {
    return data.map((el) => {
      const { user, ...rest } = el.unmarshal();

      return {
        ...rest,
        username: user?.fullName ?? "",
        deletedAt: undefined,
      }
    });
  }
}
