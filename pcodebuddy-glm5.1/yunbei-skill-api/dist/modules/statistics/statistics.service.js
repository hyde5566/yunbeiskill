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
exports.StatisticsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const skill_entity_1 = require("../skill/entities/skill.entity");
const user_entity_1 = require("../user/entities/user.entity");
const rating_entity_1 = require("../rating/entities/rating.entity");
const download_record_entity_1 = require("../download/entities/download-record.entity");
const review_entity_1 = require("../review/entities/review.entity");
const feedback_entity_1 = require("../feedback/entities/feedback.entity");
const project_entity_1 = require("../project/entities/project.entity");
const skill_category_entity_1 = require("../skill-category/entities/skill-category.entity");
let StatisticsService = class StatisticsService {
    skillRepository;
    userRepository;
    ratingRepository;
    downloadRepository;
    reviewRepository;
    feedbackRepository;
    projectRepository;
    categoryRepository;
    constructor(skillRepository, userRepository, ratingRepository, downloadRepository, reviewRepository, feedbackRepository, projectRepository, categoryRepository) {
        this.skillRepository = skillRepository;
        this.userRepository = userRepository;
        this.ratingRepository = ratingRepository;
        this.downloadRepository = downloadRepository;
        this.reviewRepository = reviewRepository;
        this.feedbackRepository = feedbackRepository;
        this.projectRepository = projectRepository;
        this.categoryRepository = categoryRepository;
    }
    async getOverview() {
        const [skillTotal, publishedTotal, userTotal, ratingTotal, downloadTotal, reviewTotal, feedbackTotal] = await Promise.all([
            this.skillRepository.count(),
            this.skillRepository.count({ where: { status: 'published' } }),
            this.userRepository.count({ where: { status: 1 } }),
            this.ratingRepository.count(),
            this.downloadRepository.count(),
            this.reviewRepository.count(),
            this.feedbackRepository.count(),
        ]);
        return {
            skill_total: skillTotal,
            published_total: publishedTotal,
            user_total: userTotal,
            rating_total: ratingTotal,
            download_total: downloadTotal,
            review_total: reviewTotal,
            feedback_total: feedbackTotal,
        };
    }
    async getDashboard() {
        const overview = await this.getOverview();
        const categoryStats = await this.getByCategory();
        const topDownloads = await this.getTopDownloads(5);
        const ratingDistribution = await this.getRatingDistribution();
        return { overview, categoryStats, topDownloads, ratingDistribution };
    }
    async getByCategory() {
        return this.skillRepository
            .createQueryBuilder('skill')
            .leftJoin('skill.category', 'category')
            .select('category.name', 'category_name')
            .addSelect('category.id', 'category_id')
            .addSelect('COUNT(*)', 'skill_count')
            .groupBy('skill.category_id')
            .getRawMany();
    }
    async getTopDownloads(limit = 10) {
        return this.downloadRepository
            .createQueryBuilder('dr')
            .leftJoin('dr.skill', 'skill')
            .select('skill.name', 'skill_name')
            .addSelect('skill.id', 'skill_id')
            .addSelect('COUNT(*)', 'download_count')
            .groupBy('dr.skill_id')
            .orderBy('download_count', 'DESC')
            .limit(limit)
            .getRawMany();
    }
    async getRatingDistribution() {
        const distribution = await this.ratingRepository
            .createQueryBuilder('rating')
            .select('rating.score', 'score')
            .addSelect('COUNT(*)', 'count')
            .groupBy('rating.score')
            .orderBy('rating.score', 'ASC')
            .getRawMany();
        const avgResult = await this.ratingRepository
            .createQueryBuilder('rating')
            .select('AVG(rating.score)', 'avg_score')
            .getRawOne();
        return {
            distribution,
            avg_score: avgResult?.avg_score ? parseFloat(avgResult.avg_score).toFixed(2) : '0.00',
        };
    }
    async getDownloadTrend(months = 6) {
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - months);
        return this.downloadRepository
            .createQueryBuilder('dr')
            .select("DATE_FORMAT(dr.downloaded_at, '%Y-%m')", 'month')
            .addSelect('COUNT(*)', 'count')
            .where('dr.downloaded_at >= :startDate', { startDate })
            .groupBy("DATE_FORMAT(dr.downloaded_at, '%Y-%m')")
            .orderBy('month', 'ASC')
            .getRawMany();
    }
    async getByRating() {
        const topRated = await this.ratingRepository
            .createQueryBuilder('rating')
            .leftJoin('rating.skill', 'skill')
            .select('skill.name', 'skill_name')
            .addSelect('skill.id', 'skill_id')
            .addSelect('AVG(rating.score)', 'avg_score')
            .addSelect('COUNT(*)', 'rating_count')
            .groupBy('rating.skill_id')
            .orderBy('avg_score', 'DESC')
            .limit(10)
            .getRawMany();
        return { top_rated: topRated };
    }
    async getByDownload() {
        const topDownloaded = await this.downloadRepository
            .createQueryBuilder('dr')
            .leftJoin('dr.skill', 'skill')
            .select('skill.name', 'skill_name')
            .addSelect('skill.id', 'skill_id')
            .addSelect('COUNT(*)', 'download_count')
            .groupBy('dr.skill_id')
            .orderBy('download_count', 'DESC')
            .limit(10)
            .getRawMany();
        return { top_downloaded: topDownloaded };
    }
    async getByProject() {
        return this.projectRepository
            .createQueryBuilder('project')
            .leftJoin('project.skills', 'ps')
            .select('project.name', 'project_name')
            .addSelect('project.id', 'project_id')
            .addSelect('COUNT(ps.id)', 'skill_count')
            .groupBy('project.id')
            .orderBy('skill_count', 'DESC')
            .getRawMany();
    }
    async getByUser() {
        return this.skillRepository
            .createQueryBuilder('skill')
            .select('skill.submitted_by', 'user_id')
            .addSelect('COUNT(*)', 'submit_count')
            .groupBy('skill.submitted_by')
            .orderBy('submit_count', 'DESC')
            .limit(10)
            .getRawMany();
    }
    async getTimeline(startDate, endDate) {
        const downloadTrend = await this.downloadRepository
            .createQueryBuilder('dr')
            .select('DATE(dr.downloaded_at)', 'date')
            .addSelect('COUNT(*)', 'count')
            .where('dr.downloaded_at BETWEEN :startDate AND :endDate', { startDate, endDate })
            .groupBy('DATE(dr.downloaded_at)')
            .orderBy('date', 'ASC')
            .getRawMany();
        const submitTrend = await this.skillRepository
            .createQueryBuilder('skill')
            .select('DATE(skill.created_at)', 'date')
            .addSelect('COUNT(*)', 'count')
            .where('skill.created_at BETWEEN :startDate AND :endDate', { startDate, endDate })
            .groupBy('DATE(skill.created_at)')
            .orderBy('date', 'ASC')
            .getRawMany();
        return { download_trend: downloadTrend, submit_trend: submitTrend };
    }
    async exportStats(type) {
        let data;
        let filename;
        switch (type) {
            case 'category':
                data = await this.getByCategory();
                filename = 'category_stats.csv';
                break;
            case 'rating':
                data = await this.getByRating();
                filename = 'rating_stats.csv';
                break;
            case 'download':
                data = await this.getByDownload();
                filename = 'download_stats.csv';
                break;
            case 'project':
                data = await this.getByProject();
                filename = 'project_stats.csv';
                break;
            default:
                data = await this.getOverview();
                filename = 'overview_stats.csv';
        }
        if (Array.isArray(data) && data.length > 0) {
            const headers = Object.keys(data[0]);
            const csvRows = [headers.join(',')];
            for (const row of data) {
                const values = headers.map(h => row[h] ?? '');
                csvRows.push(values.join(','));
            }
            const buffer = Buffer.from('\uFEFF' + csvRows.join('\n'), 'utf-8');
            return { buffer, filename };
        }
        const headers = Object.keys(data);
        const csvRows = [headers.join(','), headers.map(h => data[h] ?? '').join(',')];
        const buffer = Buffer.from('\uFEFF' + csvRows.join('\n'), 'utf-8');
        return { buffer, filename };
    }
};
exports.StatisticsService = StatisticsService;
exports.StatisticsService = StatisticsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(skill_entity_1.Skill)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(2, (0, typeorm_1.InjectRepository)(rating_entity_1.Rating)),
    __param(3, (0, typeorm_1.InjectRepository)(download_record_entity_1.DownloadRecord)),
    __param(4, (0, typeorm_1.InjectRepository)(review_entity_1.Review)),
    __param(5, (0, typeorm_1.InjectRepository)(feedback_entity_1.Feedback)),
    __param(6, (0, typeorm_1.InjectRepository)(project_entity_1.Project)),
    __param(7, (0, typeorm_1.InjectRepository)(skill_category_entity_1.SkillCategory)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], StatisticsService);
//# sourceMappingURL=statistics.service.js.map