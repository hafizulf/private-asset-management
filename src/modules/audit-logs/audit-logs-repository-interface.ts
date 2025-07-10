import BaseRepository from "../common/interfaces/base-repository-interface";
import { AuditLogsDomain, IAuditLogs } from "./audit-logs-domain";

export interface IAuditLogsRepository extends BaseRepository<AuditLogsDomain, IAuditLogs> {
}
