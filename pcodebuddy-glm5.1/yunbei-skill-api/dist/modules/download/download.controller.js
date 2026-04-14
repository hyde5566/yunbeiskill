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
exports.DownloadController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const download_service_1 = require("./download.service");
const pagination_dto_1 = require("../../common/dto/pagination.dto");
const public_decorator_1 = require("../../common/decorators/public.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let DownloadController = class DownloadController {
    downloadService;
    constructor(downloadService) {
        this.downloadService = downloadService;
    }
    getMyDownloadedSkills(pagination, user) {
        return this.downloadService.getMyDownloadedSkills(user.id, pagination);
    }
    getMyDownloadRecords(pagination, skillName, user) {
        return this.downloadService.getMyDownloadRecords(user.id, pagination, skillName);
    }
    getGlobalStats() {
        return this.downloadService.getGlobalStats();
    }
};
exports.DownloadController = DownloadController;
__decorate([
    (0, common_1.Get)('my/skills'),
    (0, swagger_1.ApiOperation)({ summary: '我下载过的Skill列表' }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_dto_1.PaginationDto, Object]),
    __metadata("design:returntype", void 0)
], DownloadController.prototype, "getMyDownloadedSkills", null);
__decorate([
    (0, common_1.Get)('my/records'),
    (0, swagger_1.ApiOperation)({ summary: '我的下载记录详情' }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Query)('skillName')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_dto_1.PaginationDto, String, Object]),
    __metadata("design:returntype", void 0)
], DownloadController.prototype, "getMyDownloadRecords", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, public_decorator_1.RequirePermission)('admin'),
    (0, swagger_1.ApiOperation)({ summary: '全局下载统计' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], DownloadController.prototype, "getGlobalStats", null);
exports.DownloadController = DownloadController = __decorate([
    (0, swagger_1.ApiTags)('下载记录'),
    (0, common_1.Controller)('downloads'),
    __metadata("design:paramtypes", [download_service_1.DownloadService])
], DownloadController);
//# sourceMappingURL=download.controller.js.map