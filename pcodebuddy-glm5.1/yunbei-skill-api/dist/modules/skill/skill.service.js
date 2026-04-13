"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SkillService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const uuid_1 = require("uuid");
const path = __importStar(require("path"));
const skill_entity_1 = require("./entities/skill.entity");
const skill_version_entity_1 = require("./entities/skill-version.entity");
const skill_visibility_entity_1 = require("./entities/skill-visibility.entity");
const project_skill_entity_1 = require("../project/entities/project-skill.entity");
const pagination_dto_1 = require("../../common/dto/pagination.dto");
let SkillService = class SkillService {
    skillRepository;
    skillVersionRepository;
    skillVisibilityRepository;
    projectSkillRepository;
    constructor(skillRepository, skillVersionRepository, skillVisibilityRepository, projectSkillRepository) {
        this.skillRepository = skillRepository;
        this.skillVersionRepository = skillVersionRepository;
        this.skillVisibilityRepository = skillVisibilityRepository;
        this.projectSkillRepository = projectSkillRepository;
    }
    async create(createDto, submitterId, zipPath, zipSize) {
        if (createDto.source_type === 'external' && !createDto.source_url) {
            throw new common_1.BadRequestException('外部平台Skill必须填写来源网址');
        }
        if (createDto.visibility_type === 'account' && (!createDto.visibility_account_ids || createDto.visibility_account_ids.length === 0)) {
            throw new common_1.BadRequestException('指定账号可见时必须选择可见账号');
        }
        const skill = this.skillRepository.create({
            unique_id: (0, uuid_1.v4)(),
            name: createDto.name,
            summary: createDto.summary,
            detail: createDto.detail,
            author: createDto.author,
            category_id: createDto.category_id,
            source_type: createDto.source_type,
            source_url: createDto.source_url,
            source_url_name: createDto.source_url_name,
            submitter_id: submitterId,
            status: 'pending_review',
            visibility_type: createDto.visibility_type,
        });
        const savedSkill = await this.skillRepository.save(skill);
        const version = this.skillVersionRepository.create({
            skill_id: savedSkill.id,
            version_number: createDto.version_number,
            zip_path: zipPath,
            zip_size: zipSize,
            change_log: createDto.change_log,
            uploader_id: submitterId,
            status: 'pending_review',
        });
        await this.skillVersionRepository.save(version);
        await this.setVisibility(savedSkill.id, createDto);
        if (createDto.project_ids && createDto.project_ids.length > 0) {
            await this.setProjectSkills(savedSkill.id, createDto.project_ids);
        }
        return this.findOne(savedSkill.id);
    }
    async setVisibility(skillId, dto) {
        await this.skillVisibilityRepository.delete({ skill_id: skillId });
        if (dto.visibility_type === 'project' && dto.project_ids) {
            for (const projectId of dto.project_ids) {
                const v = this.skillVisibilityRepository.create({
                    skill_id: skillId,
                    target_type: 'project',
                    target_id: projectId,
                });
                await this.skillVisibilityRepository.save(v);
            }
        }
        if (dto.visibility_type === 'account' && dto.visibility_account_ids) {
            for (const accountId of dto.visibility_account_ids) {
                const v = this.skillVisibilityRepository.create({
                    skill_id: skillId,
                    target_type: 'account',
                    target_id: accountId,
                });
                await this.skillVisibilityRepository.save(v);
            }
        }
    }
    async setProjectSkills(skillId, projectIds) {
        await this.projectSkillRepository.delete({ skill_id: skillId });
        for (const projectId of projectIds) {
            const ps = this.projectSkillRepository.create({
                project_id: projectId,
                skill_id: skillId,
            });
            await this.projectSkillRepository.save(ps);
        }
    }
    async findPublished(pagination, query, userId, userPermissions, userProjectIds) {
        const queryBuilder = this.skillRepository
            .createQueryBuilder('skill')
            .leftJoinAndSelect('skill.category', 'category')
            .leftJoinAndSelect('skill.submitter', 'submitter')
            .leftJoinAndSelect('skill.versions', 'version')
            .where('skill.status = :status', { status: 'published' });
        if (!userPermissions.includes('admin')) {
            queryBuilder.andWhere('(skill.visibility_type = :allVis OR ' +
                '(skill.visibility_type = :projectVis AND EXISTS (' +
                'SELECT 1 FROM skill_visibility sv WHERE sv.skill_id = skill.id AND sv.target_type = :projectType AND sv.target_id IN (:...projectIds)' +
                ')) OR ' +
                '(skill.visibility_type = :accountVis AND EXISTS (' +
                'SELECT 1 FROM skill_visibility sv WHERE sv.skill_id = skill.id AND sv.target_type = :accountType AND sv.target_id = :userId' +
                ')))', {
                allVis: 'all',
                projectVis: 'project',
                projectType: 'project',
                projectIds: userProjectIds.length > 0 ? userProjectIds : [0],
                accountVis: 'account',
                accountType: 'account',
                userId,
            });
        }
        if (query.keyword) {
            queryBuilder.andWhere('(skill.name LIKE :keyword OR skill.summary LIKE :keyword OR skill.detail LIKE :keyword)', { keyword: `%${query.keyword}%` });
        }
        if (query.category_id) {
            queryBuilder.andWhere('skill.category_id = :categoryId', { categoryId: query.category_id });
        }
        if (query.source_type) {
            queryBuilder.andWhere('skill.source_type = :sourceType', { sourceType: query.source_type });
        }
        queryBuilder
            .skip(pagination.skip)
            .take(pagination.take)
            .orderBy('skill.created_at', 'DESC');
        const [list, total] = await queryBuilder.getManyAndCount();
        return new pagination_dto_1.PaginatedResult(list, total, pagination.page, pagination.pageSize);
    }
    async findAll(pagination, query) {
        const queryBuilder = this.skillRepository
            .createQueryBuilder('skill')
            .leftJoinAndSelect('skill.category', 'category')
            .leftJoinAndSelect('skill.submitter', 'submitter');
        if (query.keyword) {
            queryBuilder.andWhere('(skill.name LIKE :keyword OR skill.summary LIKE :keyword)', { keyword: `%${query.keyword}%` });
        }
        if (query.category_id) {
            queryBuilder.andWhere('skill.category_id = :categoryId', { categoryId: query.category_id });
        }
        if (query.source_type) {
            queryBuilder.andWhere('skill.source_type = :sourceType', { sourceType: query.source_type });
        }
        if (query.status) {
            queryBuilder.andWhere('skill.status = :status', { status: query.status });
        }
        const [list, total] = await queryBuilder
            .skip(pagination.skip)
            .take(pagination.take)
            .orderBy('skill.created_at', 'DESC')
            .getManyAndCount();
        return new pagination_dto_1.PaginatedResult(list, total, pagination.page, pagination.pageSize);
    }
    async findOne(id) {
        const skill = await this.skillRepository.findOne({
            where: { id },
            relations: ['category', 'submitter', 'versions', 'visibilityList'],
        });
        if (!skill) {
            throw new common_1.NotFoundException('Skill不存在');
        }
        return skill;
    }
    async update(id, updateDto, userId) {
        const skill = await this.findOne(id);
        Object.assign(skill, updateDto);
        if (updateDto.visibility_type) {
            await this.setVisibility(id, updateDto);
        }
        if (updateDto.project_ids !== undefined) {
            await this.setProjectSkills(id, updateDto.project_ids);
        }
        skill.status = 'pending_review';
        return this.skillRepository.save(skill);
    }
    async submitVersion(skillId, dto, uploaderId, zipPath, zipSize) {
        const skill = await this.findOne(skillId);
        const version = this.skillVersionRepository.create({
            skill_id: skillId,
            version_number: dto.version_number,
            zip_path: zipPath,
            zip_size: zipSize,
            change_log: dto.change_log,
            uploader_id: uploaderId,
            status: 'pending_review',
        });
        await this.skillVersionRepository.save(version);
        skill.status = 'pending_review';
        await this.skillRepository.save(skill);
        return version;
    }
    async getVersions(skillId) {
        return this.skillVersionRepository.find({
            where: { skill_id: skillId },
            order: { created_at: 'DESC' },
        });
    }
    async getLatestPublishedVersion(skillId) {
        return this.skillVersionRepository.findOne({
            where: { skill_id: skillId, status: 'published' },
            order: { created_at: 'DESC' },
        });
    }
    async getMySubmissions(pagination, submitterId) {
        const [list, total] = await this.skillRepository.findAndCount({
            where: { submitter_id: submitterId },
            relations: ['category'],
            skip: pagination.skip,
            take: pagination.take,
            order: { created_at: 'DESC' },
        });
        return new pagination_dto_1.PaginatedResult(list, total, pagination.page, pagination.pageSize);
    }
    async publish(id) {
        const skill = await this.findOne(id);
        if (skill.status !== 'approved') {
            throw new common_1.BadRequestException('只能发布已入库状态的Skill');
        }
        skill.status = 'published';
        await this.skillRepository.save(skill);
        const latestApprovedVersion = await this.skillVersionRepository.findOne({
            where: { skill_id: id, status: 'approved' },
            order: { created_at: 'DESC' },
        });
        if (latestApprovedVersion) {
            latestApprovedVersion.status = 'published';
            await this.skillVersionRepository.save(latestApprovedVersion);
        }
        return skill;
    }
    async offline(id) {
        const skill = await this.findOne(id);
        skill.status = 'offline';
        return this.skillRepository.save(skill);
    }
    async getDownloadInfo(skillId, versionId) {
        const version = await this.skillVersionRepository.findOne({
            where: { id: versionId, skill_id: skillId },
        });
        if (!version) {
            throw new common_1.NotFoundException('版本不存在');
        }
        return {
            filePath: path.resolve(version.zip_path),
            fileName: `v${version.version_number}.zip`,
        };
    }
};
exports.SkillService = SkillService;
exports.SkillService = SkillService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(skill_entity_1.Skill)),
    __param(1, (0, typeorm_1.InjectRepository)(skill_version_entity_1.SkillVersion)),
    __param(2, (0, typeorm_1.InjectRepository)(skill_visibility_entity_1.SkillVisibility)),
    __param(3, (0, typeorm_1.InjectRepository)(project_skill_entity_1.ProjectSkill)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], SkillService);
//# sourceMappingURL=skill.service.js.map