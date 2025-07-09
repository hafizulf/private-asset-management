import { BaseQueryOption } from "../common/dto/common-dto";
import { AuditLogsDomain, IAuditLogs } from "./audit-logs-domain";

export interface IAuditLogsRepository {
  store(props: IAuditLogs, option?: BaseQueryOption): Promise<AuditLogsDomain>,
}
