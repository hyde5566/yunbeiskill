import { LoginLogService } from './login-log.service';
import { PaginationDto } from '../../common/dto/pagination.dto';
export declare class LoginLogController {
    private readonly loginLogService;
    constructor(loginLogService: LoginLogService);
    findAll(pagination: PaginationDto, startDate?: string, endDate?: string): Promise<import("../../common/dto/pagination.dto").PaginatedResult<import("./entities/login-log.entity").LoginLog>>;
}
