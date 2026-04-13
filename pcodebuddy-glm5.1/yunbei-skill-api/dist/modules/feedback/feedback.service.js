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
exports.FeedbackService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const feedback_entity_1 = require("./entities/feedback.entity");
const pagination_dto_1 = require("../../common/dto/pagination.dto");
let FeedbackService = class FeedbackService {
    feedbackRepository;
    constructor(feedbackRepository) {
        this.feedbackRepository = feedbackRepository;
    }
    async create(createDto, userId) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayFeedbackCount = await this.feedbackRepository.count({
            where: {
                user_id: userId,
                skill_id: createDto.skill_id,
            },
        });
        const recentCount = await this.feedbackRepository
            .createQueryBuilder('fb')
            .where('fb.user_id = :userId', { userId })
            .andWhere('fb.skill_id = :skillId', { skillId: createDto.skill_id })
            .andWhere('fb.created_at >= :since', { since: new Date(Date.now() - 24 * 60 * 60 * 1000) })
            .getCount();
        if (recentCount >= 3) {
            throw new common_1.BadRequestException('每天对每个Skill最多提交3条反馈');
        }
        const feedback = this.feedbackRepository.create({
            ...createDto,
            user_id: userId,
        });
        return this.feedbackRepository.save(feedback);
    }
    async getSkillFeedbacks(skillId, pagination) {
        const [list, total] = await this.feedbackRepository.findAndCount({
            where: { skill_id: skillId, is_invalid: 0 },
            relations: ['user'],
            skip: pagination.skip,
            take: pagination.take,
            order: { created_at: 'DESC' },
        });
        return new pagination_dto_1.PaginatedResult(list, total, pagination.page, pagination.pageSize);
    }
    async getMyFeedbacks(userId) {
        return this.feedbackRepository.find({
            where: { user_id: userId },
            relations: ['skill'],
            order: { created_at: 'DESC' },
        });
    }
    async markInvalid(id, dto) {
        const feedback = await this.feedbackRepository.findOne({ where: { id } });
        if (!feedback) {
            throw new common_1.NotFoundException('反馈不存在');
        }
        feedback.is_invalid = dto.is_invalid;
        return this.feedbackRepository.save(feedback);
    }
    async findAll(pagination) {
        const [list, total] = await this.feedbackRepository.findAndCount({
            relations: ['user', 'skill'],
            skip: pagination.skip,
            take: pagination.take,
            order: { created_at: 'DESC' },
        });
        return new pagination_dto_1.PaginatedResult(list, total, pagination.page, pagination.pageSize);
    }
};
exports.FeedbackService = FeedbackService;
exports.FeedbackService = FeedbackService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(feedback_entity_1.Feedback)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], FeedbackService);
//# sourceMappingURL=feedback.service.js.map