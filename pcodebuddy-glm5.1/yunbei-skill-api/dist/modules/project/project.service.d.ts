import { Repository } from 'typeorm';
import { Project } from './entities/project.entity';
import { ProjectMember } from './entities/project-member.entity';
import { ProjectSkill } from './entities/project-skill.entity';
import { CreateProjectDto, UpdateProjectDto, AddProjectMembersDto, AddProjectSkillDto } from './dto/project.dto';
import { PaginatedResult, PaginationDto } from '../../common/dto/pagination.dto';
export declare class ProjectService {
    private projectRepository;
    private projectMemberRepository;
    private projectSkillRepository;
    constructor(projectRepository: Repository<Project>, projectMemberRepository: Repository<ProjectMember>, projectSkillRepository: Repository<ProjectSkill>);
    create(createDto: CreateProjectDto): Promise<Project>;
    findAll(pagination: PaginationDto, keyword?: string): Promise<PaginatedResult<Project>>;
    findOne(id: number): Promise<Project>;
    update(id: number, updateDto: UpdateProjectDto): Promise<Project>;
    remove(id: number): Promise<void>;
    getMembers(projectId: number): Promise<ProjectMember[]>;
    addMembers(projectId: number, dto: AddProjectMembersDto): Promise<void>;
    removeMember(projectId: number, userId: number): Promise<void>;
    addSkills(projectId: number, dto: AddProjectSkillDto): Promise<void>;
    removeSkill(projectId: number, skillId: number): Promise<void>;
    getUserProjectIds(userId: number): Promise<number[]>;
}
