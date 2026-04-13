import { DownloadService } from './download.service';
import { PaginationDto } from '../../common/dto/pagination.dto';
export declare class DownloadController {
    private readonly downloadService;
    constructor(downloadService: DownloadService);
    getMyDownloadedSkills(pagination: PaginationDto, user: any): Promise<import("../../common/dto/pagination.dto").PaginatedResult<import("./entities/download-record.entity").DownloadRecord>>;
    getMyDownloadRecords(pagination: PaginationDto, skillName?: string, user?: any): Promise<import("../../common/dto/pagination.dto").PaginatedResult<import("./entities/download-record.entity").DownloadRecord>>;
    getGlobalStats(): Promise<{
        total_downloads: number;
        top_skills: any[];
    }>;
}
