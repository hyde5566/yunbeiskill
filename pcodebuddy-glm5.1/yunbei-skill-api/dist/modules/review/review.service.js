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
exports.ReviewService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const review_entity_1 = require("./entities/review.entity");
const skill_entity_1 = require("../skill/entities/skill.entity");
const skill_version_entity_1 = require("../skill/entities/skill-version.entity");
const pagination_dto_1 = require("../../common/dto/pagination.dto");
let ReviewService = class ReviewService {
    reviewRepository;
    skillRepository;
    skillVersionRepository;
    constructor(reviewRepository, skillRepository, skillVersionRepository) {
        this.reviewRepository = reviewRepository;
        this.skillRepository = skillRepository;
        this.skillVersionRepository = skillVersionRepository;
    }
    async assignReviewer(assignDto, assignedBy) {
        const review = this.reviewRepository.create({
            skill_id: assignDto.skill_id,
            version_id: assignDto.version_id,
            reviewer_id: assignDto.reviewer_id,
            assigned_by: assignedBy,
            status: 'pending',
        });
        const saved = await this.reviewRepository.save(review);
        await this.skillRepository.update(assignDto.skill_id, { status: 'reviewing' });
        return saved;
    }
    async getPendingReviews(pagination, reviewerId, isAdmin) {
        const query = this.reviewRepository
            .createQueryBuilder('review')
            .leftJoinAndSelect('review.skill', 'skill')
            .leftJoinAndSelect('skill.submitter', 'submitter')
            .leftJoinAndSelect('skill.category', 'category')
            .leftJoinAndSelect('review.version', 'version')
            .leftJoinAndSelect('review.reviewer', 'reviewer')
            .where('review.status = :status', { status: 'pending' });
        if (reviewerId && !isAdmin) {
            query.andWhere('(review.reviewer_id = :reviewerId OR review.reviewer_id IS NULL)', { reviewerId });
        }
        const [list, total] = await query
            .skip(pagination.skip)
            .take(pagination.take)
            .orderBy('review.created_at', 'DESC')
            .getManyAndCount();
        return new pagination_dto_1.PaginatedResult(list, total, pagination.page, pagination.pageSize);
    }
    async findOne(reviewId) {
        const review = await this.reviewRepository.findOne({
            where: { id: reviewId },
            relations: ['skill', 'skill.submitter', 'skill.category', 'version', 'reviewer', 'assigner'],
        });
        if (!review) {
            throw new common_1.NotFoundException('审核记录不存在');
        }
        return review;
    }
    async getReviewsBySkillId(skillId) {
        return this.reviewRepository.find({
            where: { skill_id: skillId },
            relations: ['reviewer'],
            order: { created_at: 'DESC' },
        });
    }
    async reviewAction(reviewId, actionDto, reviewerId) {
        const review = await this.reviewRepository.findOne({
            where: { id: reviewId },
        });
        if (!review) {
            throw new common_1.NotFoundException('审核记录不存在');
        }
        if (review.reviewer_id !== null && Number(review.reviewer_id) !== Number(reviewerId)) {
            throw new common_1.BadRequestException('只能审核分配给自己的任务');
        }
        if (review.status !== 'pending') {
            throw new common_1.BadRequestException('该审核任务已处理');
        }
        if (review.reviewer_id === null) {
            review.reviewer_id = reviewerId;
        }
        review.status = actionDto.status;
        review.comment = actionDto.comment || '';
        review.reviewed_at = new Date();
        await this.reviewRepository.save(review);
        if (actionDto.status === 'approved') {
            await this.skillRepository.update(review.skill_id, { status: 'approved' });
            await this.skillVersionRepository.update(review.version_id, { status: 'approved' });
        }
        else {
            await this.skillRepository.update(review.skill_id, { status: 'rejected' });
            await this.skillVersionRepository.update(review.version_id, { status: 'rejected' });
        }
        return review;
    }
    async getReviewHistory(pagination, skillId) {
        const query = this.reviewRepository
            .createQueryBuilder('review')
            .leftJoinAndSelect('review.skill', 'skill')
            .leftJoinAndSelect('skill.submitter', 'submitter')
            .leftJoinAndSelect('skill.category', 'category')
            .leftJoinAndSelect('review.reviewer', 'reviewer')
            .leftJoinAndSelect('review.assigner', 'assigner');
        if (skillId) {
            query.where('review.skill_id = :skillId', { skillId });
        }
        const [list, total] = await query
            .skip(pagination.skip)
            .take(pagination.take)
            .orderBy('review.created_at', 'DESC')
            .getManyAndCount();
        return new pagination_dto_1.PaginatedResult(list, total, pagination.page, pagination.pageSize);
    }
};
exports.ReviewService = ReviewService;
exports.ReviewService = ReviewService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(review_entity_1.Review)),
    __param(1, (0, typeorm_1.InjectRepository)(skill_entity_1.Skill)),
    __param(2, (0, typeorm_1.InjectRepository)(skill_version_entity_1.SkillVersion)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ReviewService);
//# sourceMappingURL=review.service.js.map