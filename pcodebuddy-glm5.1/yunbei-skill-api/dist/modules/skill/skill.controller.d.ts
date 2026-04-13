import type { Response } from 'express';
import { SkillService } from './skill.service';
import { CreateSkillDto, UpdateSkillDto, SubmitVersionDto, SkillQueryDto } from './dto/skill.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
export declare class SkillController {
    private readonly skillService;
    constructor(skillService: SkillService);
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
    downloadZip(skillId: number, versionId: number, res: Response): Promise<void>;
}
