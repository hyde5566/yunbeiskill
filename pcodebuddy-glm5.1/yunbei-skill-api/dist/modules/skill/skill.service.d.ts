import { Repository } from 'typeorm';
import { Skill } from './entities/skill.entity';
import { SkillVersion } from './entities/skill-version.entity';
import { SkillVisibility } from './entities/skill-visibility.entity';
import { ProjectSkill } from '../project/entities/project-skill.entity';
import { CreateSkillDto, UpdateSkillDto, SubmitVersionDto, SkillQueryDto } from './dto/skill.dto';
import { PaginatedResult, PaginationDto } from '../../common/dto/pagination.dto';
export declare class SkillService {
    private skillRepository;
    private skillVersionRepository;
    private skillVisibilityRepository;
    private projectSkillRepository;
    constructor(skillRepository: Repository<Skill>, skillVersionRepository: Repository<SkillVersion>, skillVisibilityRepository: Repository<SkillVisibility>, projectSkillRepository: Repository<ProjectSkill>);
    create(createDto: CreateSkillDto, submitterId: number, zipPath: string, zipSize: number): Promise<Skill>;
    private setVisibility;
    private setProjectSkills;
    findPublished(pagination: PaginationDto, query: SkillQueryDto, userId: number, userPermissions: string[], userProjectIds: number[]): Promise<PaginatedResult<Skill>>;
    findAll(pagination: PaginationDto, query: SkillQueryDto): Promise<PaginatedResult<Skill>>;
    findOne(id: number): Promise<Skill>;
    update(id: number, updateDto: UpdateSkillDto, userId: number): Promise<Skill>;
    submitVersion(skillId: number, dto: SubmitVersionDto, uploaderId: number, zipPath: string, zipSize: number): Promise<SkillVersion>;
    getVersions(skillId: number): Promise<SkillVersion[]>;
    getLatestPublishedVersion(skillId: number): Promise<SkillVersion | null>;
    getMySubmissions(pagination: PaginationDto, submitterId: number): Promise<PaginatedResult<Skill>>;
    publish(id: number): Promise<Skill>;
    offline(id: number): Promise<Skill>;
    getDownloadInfo(skillId: number, versionId: number): Promise<{
        filePath: string;
        fileName: string;
    }>;
}
