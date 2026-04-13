import { OperationLogService } from './operation-log.service';
import { PaginationDto } from '../../common/dto/pagination.dto';
export declare class OperationLogController {
    private readonly operationLogService;
    constructor(operationLogService: OperationLogService);
    findAll(pagination: PaginationDto, module?: string, startDate?: string, endDate?: string): Promise<import("../../common/dto/pagination.dto").PaginatedResult<import("./entities/operation-log.entity").OperationLog>>;
}
