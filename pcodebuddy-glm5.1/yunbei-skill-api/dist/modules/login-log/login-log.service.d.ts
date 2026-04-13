import { Repository } from 'typeorm';
import { LoginLog } from './entities/login-log.entity';
import { PaginatedResult, PaginationDto } from '../../common/dto/pagination.dto';
export declare class LoginLogService {
    private loginLogRepository;
    constructor(loginLogRepository: Repository<LoginLog>);
    create(userId: number, username: string, loginType: string, ipAddress?: string, device?: string, status?: number): Promise<LoginLog>;
    findAll(pagination: PaginationDto, startDate?: string, endDate?: string): Promise<PaginatedResult<LoginLog>>;
}
