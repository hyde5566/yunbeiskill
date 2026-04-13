import { Repository } from 'typeorm';
import { OperationLog } from './entities/operation-log.entity';
import { PaginatedResult, PaginationDto } from '../../common/dto/pagination.dto';
export declare class OperationLogService {
    private operationLogRepository;
    constructor(operationLogRepository: Repository<OperationLog>);
    create(userId: number, module: string, action: string, detail?: string, targetType?: string, targetId?: number, ipAddress?: string): Promise<OperationLog>;
    findAll(pagination: PaginationDto, module?: string, startDate?: string, endDate?: string): Promise<PaginatedResult<OperationLog>>;
}
