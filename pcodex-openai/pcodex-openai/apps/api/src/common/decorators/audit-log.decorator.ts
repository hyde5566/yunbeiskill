import { SetMetadata } from "@nestjs/common";

export interface AuditLogMeta {
  module: string;
  operationType: string;
  targetType: string;
}

export const AUDIT_LOG_KEY = "audit_log";
export const AuditLog = (meta: AuditLogMeta) => SetMetadata(AUDIT_LOG_KEY, meta);
