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
exports.FeedbackController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const feedback_service_1 = require("./feedback.service");
const feedback_dto_1 = require("./dto/feedback.dto");
const pagination_dto_1 = require("../../common/dto/pagination.dto");
const public_decorator_1 = require("../../common/decorators/public.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let FeedbackController = class FeedbackController {
    feedbackService;
    constructor(feedbackService) {
        this.feedbackService = feedbackService;
    }
    create(createDto, user) {
        return this.feedbackService.create(createDto, user.id);
    }
    getSkillFeedbacks(skillId, pagination) {
        return this.feedbackService.getSkillFeedbacks(skillId, pagination);
    }
    getMyFeedbacks(user) {
        return this.feedbackService.getMyFeedbacks(user.id);
    }
    findAll(pagination) {
        return this.feedbackService.findAll(pagination);
    }
    markInvalid(id, dto) {
        return this.feedbackService.markInvalid(id, dto);
    }
};
exports.FeedbackController = FeedbackController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: '提交反馈' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [feedback_dto_1.CreateFeedbackDto, Object]),
    __metadata("design:returntype", void 0)
], FeedbackController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('skill/:skillId'),
    (0, swagger_1.ApiOperation)({ summary: '获取Skill反馈列表' }),
    __param(0, (0, common_1.Param)('skillId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, pagination_dto_1.PaginationDto]),
    __metadata("design:returntype", void 0)
], FeedbackController.prototype, "getSkillFeedbacks", null);
__decorate([
    (0, common_1.Get)('my'),
    (0, swagger_1.ApiOperation)({ summary: '我的反馈记录' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], FeedbackController.prototype, "getMyFeedbacks", null);
__decorate([
    (0, common_1.Get)('all'),
    (0, public_decorator_1.RequirePermission)('admin'),
    (0, swagger_1.ApiOperation)({ summary: '所有反馈（管理员）' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_dto_1.PaginationDto]),
    __metadata("design:returntype", void 0)
], FeedbackController.prototype, "findAll", null);
__decorate([
    (0, common_1.Put)(':id/invalid'),
    (0, public_decorator_1.RequirePermission)('admin'),
    (0, swagger_1.ApiOperation)({ summary: '标记无效反馈' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, feedback_dto_1.MarkInvalidDto]),
    __metadata("design:returntype", void 0)
], FeedbackController.prototype, "markInvalid", null);
exports.FeedbackController = FeedbackController = __decorate([
    (0, swagger_1.ApiTags)('反馈'),
    (0, common_1.Controller)('feedbacks'),
    __metadata("design:paramtypes", [feedback_service_1.FeedbackService])
], FeedbackController);
//# sourceMappingURL=feedback.controller.js.map