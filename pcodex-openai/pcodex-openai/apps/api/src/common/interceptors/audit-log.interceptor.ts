import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable, tap } from "rxjs";
import { PrismaService } from "../../database/prisma.service";
import { AUDIT_LOG_KEY, type AuditLogMeta } from "../decorators/audit-log.decorator";

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const meta = this.reflector.getAllAndOverride<AuditLogMeta>(AUDIT_LOG_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!meta) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest<{
      user?: { sub?: string; account?: string };
      params?: Record<string, string>;
      auditLogOverride?: {
        operationType?: string;
        targetId?: string | null;
        detailJson?: string;
      };
    }>();

    return next.handle().pipe(
      tap(async (result: any) => {
        const auditLogOverride = request.auditLogOverride;
        const targetId =
          auditLogOverride?.targetId ??
          result?.data?.id ??
          result?.data?.targetId ??
          request.params?.id ??
          request.params?.userId ??
          null;

        await this.prisma.operationLog.create({
          data: {
            operatorId: request.user?.sub ?? null,
            operatorName: request.user?.account ?? "system",
            module: meta.module,
            operationType: auditLogOverride?.operationType ?? meta.operationType,
            targetType: meta.targetType,
            targetId,
            detailJson: auditLogOverride?.detailJson ?? JSON.stringify(result?.data ?? result ?? {}),
          },
        });
      }),
    );
  }
}
