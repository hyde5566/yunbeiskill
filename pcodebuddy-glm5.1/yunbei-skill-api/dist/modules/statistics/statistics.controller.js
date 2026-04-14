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
exports.StatisticsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const statistics_service_1 = require("./statistics.service");
const public_decorator_1 = require("../../common/decorators/public.decorator");
let StatisticsController = class StatisticsController {
    statisticsService;
    constructor(statisticsService) {
        this.statisticsService = statisticsService;
    }
    getOverview() {
        return this.statisticsService.getOverview();
    }
    getDashboard() {
        return this.statisticsService.getDashboard();
    }
    getByCategory() {
        return this.statisticsService.getByCategory();
    }
    getTopDownloads(limit) {
        return this.statisticsService.getTopDownloads(limit ? parseInt(limit, 10) : 10);
    }
    getRatingDistribution() {
        return this.statisticsService.getRatingDistribution();
    }
    getDownloadTrend(months) {
        return this.statisticsService.getDownloadTrend(months ? parseInt(months, 10) : 6);
    }
    getByRating() {
        return this.statisticsService.getByRating();
    }
    getByDownload() {
        return this.statisticsService.getByDownload();
    }
    getByProject() {
        return this.statisticsService.getByProject();
    }
    getByUser() {
        return this.statisticsService.getByUser();
    }
    getTimeline(startDate, endDate) {
        return this.statisticsService.getTimeline(startDate, endDate);
    }
    async exportStats(type, res) {
        const { buffer, filename } = await this.statisticsService.exportStats(type);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(buffer);
    }
};
exports.StatisticsController = StatisticsController;
__decorate([
    (0, common_1.Get)('overview'),
    (0, swagger_1.ApiOperation)({ summary: '全局统计概览' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], StatisticsController.prototype, "getOverview", null);
__decorate([
    (0, common_1.Get)('dashboard'),
    (0, swagger_1.ApiOperation)({ summary: '仪表盘数据' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], StatisticsController.prototype, "getDashboard", null);
__decorate([
    (0, common_1.Get)('by-category'),
    (0, swagger_1.ApiOperation)({ summary: '分类统计' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], StatisticsController.prototype, "getByCategory", null);
__decorate([
    (0, common_1.Get)('top-downloads'),
    (0, swagger_1.ApiOperation)({ summary: '下载Top统计' }),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], StatisticsController.prototype, "getTopDownloads", null);
__decorate([
    (0, common_1.Get)('rating-distribution'),
    (0, swagger_1.ApiOperation)({ summary: '评分分布' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], StatisticsController.prototype, "getRatingDistribution", null);
__decorate([
    (0, common_1.Get)('download-trend'),
    (0, swagger_1.ApiOperation)({ summary: '下载趋势' }),
    __param(0, (0, common_1.Query)('months')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], StatisticsController.prototype, "getDownloadTrend", null);
__decorate([
    (0, common_1.Get)('by-rating'),
    (0, swagger_1.ApiOperation)({ summary: '评分统计' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], StatisticsController.prototype, "getByRating", null);
__decorate([
    (0, common_1.Get)('by-download'),
    (0, swagger_1.ApiOperation)({ summary: '下载统计' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], StatisticsController.prototype, "getByDownload", null);
__decorate([
    (0, common_1.Get)('by-project'),
    (0, swagger_1.ApiOperation)({ summary: '项目统计' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], StatisticsController.prototype, "getByProject", null);
__decorate([
    (0, common_1.Get)('by-user'),
    (0, swagger_1.ApiOperation)({ summary: '用户统计' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], StatisticsController.prototype, "getByUser", null);
__decorate([
    (0, common_1.Get)('timeline'),
    (0, swagger_1.ApiOperation)({ summary: '时间维度统计' }),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], StatisticsController.prototype, "getTimeline", null);
__decorate([
    (0, common_1.Get)('export/:type'),
    (0, swagger_1.ApiOperation)({ summary: '导出统计' }),
    __param(0, (0, common_1.Param)('type')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], StatisticsController.prototype, "exportStats", null);
exports.StatisticsController = StatisticsController = __decorate([
    (0, swagger_1.ApiTags)('统计管理'),
    (0, common_1.Controller)('statistics'),
    (0, public_decorator_1.RequirePermission)('admin'),
    __metadata("design:paramtypes", [statistics_service_1.StatisticsService])
], StatisticsController);
//# sourceMappingURL=statistics.controller.js.map