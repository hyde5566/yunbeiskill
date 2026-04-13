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
exports.DownloadService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const download_record_entity_1 = require("./entities/download-record.entity");
const pagination_dto_1 = require("../../common/dto/pagination.dto");
let DownloadService = class DownloadService {
    downloadRepository;
    constructor(downloadRepository) {
        this.downloadRepository = downloadRepository;
    }
    async recordDownload(userId, skillId, versionId, departmentId) {
        const record = this.downloadRepository.create({
            user_id: userId,
            skill_id: skillId,
            version_id: versionId,
            department_id: departmentId,
        });
        return this.downloadRepository.save(record);
    }
    async getMyDownloadedSkills(userId, pagination) {
        const query = this.downloadRepository
            .createQueryBuilder('dr')
            .leftJoinAndSelect('dr.skill', 'skill')
            .leftJoinAndSelect('dr.version', 'version')
            .where('dr.user_id = :userId', { userId });
        const [list, total] = await query
            .distinctOn(['dr.skill_id'])
            .skip(pagination.skip)
            .take(pagination.take)
            .orderBy('dr.skill_id', 'ASC')
            .addOrderBy('dr.downloaded_at', 'DESC')
            .getManyAndCount();
        return new pagination_dto_1.PaginatedResult(list, total, pagination.page, pagination.pageSize);
    }
    async getMyDownloadRecords(userId, pagination, skillName) {
        const query = this.downloadRepository
            .createQueryBuilder('dr')
            .leftJoinAndSelect('dr.skill', 'skill')
            .leftJoinAndSelect('dr.version', 'version')
            .leftJoinAndSelect('dr.department', 'department')
            .where('dr.user_id = :userId', { userId });
        if (skillName) {
            query.andWhere('skill.name LIKE :name', { name: `%${skillName}%` });
        }
        const [list, total] = await query
            .skip(pagination.skip)
            .take(pagination.take)
            .orderBy('dr.downloaded_at', 'DESC')
            .getManyAndCount();
        return new pagination_dto_1.PaginatedResult(list, total, pagination.page, pagination.pageSize);
    }
    async getGlobalStats() {
        const totalDownloads = await this.downloadRepository.count();
        const skillStats = await this.downloadRepository
            .createQueryBuilder('dr')
            .select('dr.skill_id', 'skill_id')
            .addSelect('COUNT(*)', 'download_count')
            .groupBy('dr.skill_id')
            .orderBy('download_count', 'DESC')
            .limit(10)
            .getRawMany();
        return {
            total_downloads: totalDownloads,
            top_skills: skillStats,
        };
    }
};
exports.DownloadService = DownloadService;
exports.DownloadService = DownloadService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(download_record_entity_1.DownloadRecord)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], DownloadService);
//# sourceMappingURL=download.service.js.map