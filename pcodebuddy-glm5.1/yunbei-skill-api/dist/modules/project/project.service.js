"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const project_entity_1 = require("./entities/project.entity");
const project_member_entity_1 = require("./entities/project-member.entity");
const project_skill_entity_1 = require("./entities/project-skill.entity");
const pagination_dto_1 = require("../../common/dto/pagination.dto");
let ProjectService = class ProjectService {
    projectRepository;
    projectMemberRepository;
    projectSkillRepository;
    constructor(projectRepository, projectMemberRepository, projectSkillRepository) {
        this.projectRepository = projectRepository;
        this.projectMemberRepository = projectMemberRepository;
        this.projectSkillRepository = projectSkillRepository;
    }
    async create(createDto) {
        const project = this.projectRepository.create(createDto);
        const saved = await this.projectRepository.save(project);
        const member = this.projectMemberRepository.create({
            project_id: saved.id,
            user_id: createDto.owner_id,
            role: 'owner',
        });
        await this.projectMemberRepository.save(member);
        return saved;
    }
    async findAll(pagination, keyword) {
        const query = this.projectRepository
            .createQueryBuilder('project')
            .leftJoinAndSelect('project.owner', 'owner');
        if (keyword) {
            query.where('project.name LIKE :keyword', { keyword: `%${keyword}%` });
        }
        const [list, total] = await query
            .skip(pagination.skip)
            .take(pagination.take)
            .orderBy('project.created_at', 'DESC')
            .getManyAndCount();
        return new pagination_dto_1.PaginatedResult(list, total, pagination.page, pagination.pageSize);
    }
    async findOne(id) {
        const project = await this.projectRepository.findOne({
            where: { id },
            relations: ['owner'],
        });
        if (!project) {
            throw new common_1.NotFoundException('项目不存在');
        }
        return project;
    }
    async update(id, updateDto) {
        const project = await this.findOne(id);
        Object.assign(project, updateDto);
        return this.projectRepository.save(project);
    }
    async remove(id) {
        const project = await this.findOne(id);
        const skillCount = await this.projectSkillRepository.count({
            where: { project_id: id },
        });
        if (skillCount > 0) {
            throw new common_1.BadRequestException('该项目下有关联Skill，无法删除');
        }
        await this.projectMemberRepository.delete({ project_id: id });
        await this.projectRepository.remove(project);
    }
    async getMembers(projectId) {
        await this.findOne(projectId);
        return this.projectMemberRepository.find({
            where: { project_id: projectId },
            relations: ['user'],
        });
    }
    async addMembers(projectId, dto) {
        await this.findOne(projectId);
        const members = dto.user_ids.map((userId) => this.projectMemberRepository.create({
            project_id: projectId,
            user_id: userId,
            role: 'member',
        }));
        for (const member of members) {
            const exists = await this.projectMemberRepository.findOne({
                where: { project_id: projectId, user_id: member.user_id },
            });
            if (!exists) {
                await this.projectMemberRepository.save(member);
            }
        }
    }
    async removeMember(projectId, userId) {
        const member = await this.projectMemberRepository.findOne({
            where: { project_id: projectId, user_id: userId },
        });
        if (member && member.role === 'owner') {
            throw new common_1.BadRequestException('不能移除项目负责人');
        }
        await this.projectMemberRepository.delete({ project_id: projectId, user_id: userId });
    }
    async addSkills(projectId, dto) {
        await this.findOne(projectId);
        for (const skillId of dto.skill_ids) {
            const exists = await this.projectSkillRepository.findOne({
                where: { project_id: projectId, skill_id: skillId },
            });
            if (!exists) {
                const ps = this.projectSkillRepository.create({
                    project_id: projectId,
                    skill_id: skillId,
                });
                await this.projectSkillRepository.save(ps);
            }
        }
    }
    async removeSkill(projectId, skillId) {
        await this.projectSkillRepository.delete({ project_id: projectId, skill_id: skillId });
    }
    async getUserProjectIds(userId) {
        const members = await this.projectMemberRepository.find({
            where: { user_id: userId },
        });
        return members.map((m) => m.project_id);
    }
};
exports.ProjectService = ProjectService;
exports.ProjectService = ProjectService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(project_entity_1.Project)),
    __param(1, (0, typeorm_1.InjectRepository)(project_member_entity_1.ProjectMember)),
    __param(2, (0, typeorm_1.InjectRepository)(project_skill_entity_1.ProjectSkill)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ProjectService);
//# sourceMappingURL=project.service.js.map