import { injectable } from "inversify";
import { IAuditLogsRepository } from "./audit-logs-repository-interface";
import { IAuditLogs, AuditLogsDomain } from "./audit-logs-domain";
import { AuditLogs as AuditLogsPersistence } from "./audit-logs-model";
import { BaseQueryOption } from "../common/dto/common-dto";

@injectable()
export class AuditLogsRepository implements IAuditLogsRepository {
  store = async (props: IAuditLogs, option?: BaseQueryOption): Promise<AuditLogsDomain> => {
    const data = await AuditLogsPersistence.create(props, { transaction: option?.transaction });
    return AuditLogsDomain.create(data.toJSON());
  }
}
