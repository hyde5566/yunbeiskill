import { ProjectService } from './project.service';
import { CreateProjectDto, UpdateProjectDto, AddProjectMembersDto, AddProjectSkillDto } from './dto/project.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
export declare class ProjectController {
    private readonly projectService;
    constructor(projectService: ProjectService);
    findAll(pagination: PaginationDto, keyword?: string): Promise<import("../../common/dto/pagination.dto").PaginatedResult<import("./entities/project.entity").Project>>;
    findOne(id: number): Promise<import("./entities/project.entity").Project>;
    getMembers(id: number): Promise<import("./entities/project-member.entity").ProjectMember[]>;
    create(createDto: CreateProjectDto): Promise<import("./entities/project.entity").Project>;
    update(id: number, updateDto: UpdateProjectDto): Promise<import("./entities/project.entity").Project>;
    remove(id: number): Promise<void>;
    addMembers(id: number, dto: AddProjectMembersDto): Promise<void>;
    removeMember(id: number, userId: number): Promise<void>;
    addSkills(id: number, dto: AddProjectSkillDto): Promise<void>;
    removeSkill(id: number, skillId: number): Promise<void>;
}
