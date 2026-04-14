import { Repository } from 'typeorm';
import type { Response } from 'express';
import { SkillService } from './skill.service';
import { ProjectService } from '../project/project.service';
import { DownloadService } from '../download/download.service';
import { User } from '../user/entities/user.entity';
import { CreateSkillDto, UpdateSkillDto, SubmitVersionDto, SkillQueryDto } from './dto/skill.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
export declare class SkillController {
    private readonly skillService;
    private readonly projectService;
    private readonly downloadService;
    private userRepository;
    constructor(skillService: SkillService, projectService: ProjectService, downloadService: DownloadService, userRepository: Repository<User>);
    findPublished(pagination: PaginationDto, query: SkillQueryDto, user: any): Promise<import("../../common/dto/pagination.dto").PaginatedResult<import("./entities/skill.entity").Skill>>;
    findAll(pagination: PaginationDto, query: SkillQueryDto): Promise<import("../../common/dto/pagination.dto").PaginatedResult<import("./entities/skill.entity").Skill>>;
    getMySubmissions(pagination: PaginationDto, user: any): Promise<import("../../common/dto/pagination.dto").PaginatedResult<import("./entities/skill.entity").Skill>>;
    findOne(id: number): Promise<import("./entities/skill.entity").Skill>;
    create(createDto: CreateSkillDto, zipFile: Express.Multer.File, user: any): Promise<import("./entities/skill.entity").Skill>;
    update(id: number, updateDto: UpdateSkillDto, user: any): Promise<import("./entities/skill.entity").Skill>;
    submitVersion(id: number, dto: SubmitVersionDto, zipFile: Express.Multer.File, user: any): Promise<import("./entities/skill-version.entity").SkillVersion>;
    getVersions(id: number): Promise<import("./entities/skill-version.entity").SkillVersion[]>;
    publish(id: number): Promise<import("./entities/skill.entity").Skill>;
    offline(id: number): Promise<import("./entities/skill.entity").Skill>;
    resubmit(id: number, user: any): Promise<import("./entities/skill.entity").Skill>;
    remove(id: number, user: any): Promise<{
        message: string;
    }>;
    downloadZip(skillId: number, versionId: number, user: any, res: Response): Promise<void>;
}
