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
exports.RatingService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const rating_entity_1 = require("./entities/rating.entity");
let RatingService = class RatingService {
    ratingRepository;
    constructor(ratingRepository) {
        this.ratingRepository = ratingRepository;
    }
    async create(createDto, userId) {
        const existing = await this.ratingRepository.findOne({
            where: {
                user_id: userId,
                skill_id: createDto.skill_id,
                version_id: createDto.version_id,
            },
        });
        if (existing) {
            throw new common_1.BadRequestException('您已对该版本评过分');
        }
        const rating = this.ratingRepository.create({
            ...createDto,
            user_id: userId,
        });
        return this.ratingRepository.save(rating);
    }
    async getSkillRatings(skillId) {
        const ratings = await this.ratingRepository.find({
            where: { skill_id: skillId },
        });
        const total = ratings.length;
        const avgScore = total > 0
            ? ratings.reduce((sum, r) => sum + r.score, 0) / total
            : 0;
        const distribution = [0, 0, 0, 0, 0];
        ratings.forEach((r) => {
            distribution[r.score - 1]++;
        });
        return {
            skill_id: skillId,
            average_score: Math.round(avgScore * 10) / 10,
            total_count: total,
            distribution,
        };
    }
    async getMyRatings(userId) {
        return this.ratingRepository.find({
            where: { user_id: userId },
            relations: ['skill', 'version'],
            order: { created_at: 'DESC' },
        });
    }
};
exports.RatingService = RatingService;
exports.RatingService = RatingService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(rating_entity_1.Rating)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], RatingService);
//# sourceMappingURL=rating.service.js.map