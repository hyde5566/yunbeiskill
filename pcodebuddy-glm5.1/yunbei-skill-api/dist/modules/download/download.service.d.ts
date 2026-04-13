import { Repository } from 'typeorm';
import { DownloadRecord } from './entities/download-record.entity';
import { PaginatedResult, PaginationDto } from '../../common/dto/pagination.dto';
export declare class DownloadService {
    private downloadRepository;
    constructor(downloadRepository: Repository<DownloadRecord>);
    recordDownload(userId: number, skillId: number, versionId: number, departmentId: number): Promise<DownloadRecord>;
    getMyDownloadedSkills(userId: number, pagination: PaginationDto): Promise<PaginatedResult<DownloadRecord>>;
    getMyDownloadRecords(userId: number, pagination: PaginationDto, skillName?: string): Promise<PaginatedResult<DownloadRecord>>;
    getGlobalStats(): Promise<{
        total_downloads: number;
        top_skills: any[];
    }>;
}
