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
exports.ReviewController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const review_service_1 = require("./review.service");
const review_dto_1 = require("./dto/review.dto");
const pagination_dto_1 = require("../../common/dto/pagination.dto");
const public_decorator_1 = require("../../common/decorators/public.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let ReviewController = class ReviewController {
    reviewService;
    constructor(reviewService) {
        this.reviewService = reviewService;
    }
    getPendingReviews(pagination, user) {
        return this.reviewService.getPendingReviews(pagination, user.userId);
    }
    getAllReviews(pagination, skillId) {
        return this.reviewService.getReviewHistory(pagination, skillId);
    }
    assignReviewer(assignDto, user) {
        return this.reviewService.assignReviewer(assignDto, user.userId);
    }
    reviewAction(id, actionDto, user) {
        return this.reviewService.reviewAction(id, actionDto, user.userId);
    }
};
exports.ReviewController = ReviewController;
__decorate([
    (0, common_1.Get)('pending'),
    (0, public_decorator_1.RequirePermission)('review'),
    (0, swagger_1.ApiOperation)({ summary: '获取待审核列表' }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_dto_1.PaginationDto, Object]),
    __metadata("design:returntype", void 0)
], ReviewController.prototype, "getPendingReviews", null);
__decorate([
    (0, common_1.Get)('all'),
    (0, public_decorator_1.RequirePermission)('admin'),
    (0, swagger_1.ApiOperation)({ summary: '获取所有审核记录' }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Query)('skillId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_dto_1.PaginationDto, Number]),
    __metadata("design:returntype", void 0)
], ReviewController.prototype, "getAllReviews", null);
__decorate([
    (0, common_1.Post)('assign'),
    (0, public_decorator_1.RequirePermission)('admin'),
    (0, swagger_1.ApiOperation)({ summary: '分配审核员' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [review_dto_1.AssignReviewerDto, Object]),
    __metadata("design:returntype", void 0)
], ReviewController.prototype, "assignReviewer", null);
__decorate([
    (0, common_1.Post)(':id/action'),
    (0, public_decorator_1.RequirePermission)('review'),
    (0, swagger_1.ApiOperation)({ summary: '执行审核（通过/驳回）' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, review_dto_1.ReviewActionDto, Object]),
    __metadata("design:returntype", void 0)
], ReviewController.prototype, "reviewAction", null);
exports.ReviewController = ReviewController = __decorate([
    (0, swagger_1.ApiTags)('审核管理'),
    (0, common_1.Controller)('reviews'),
    __metadata("design:paramtypes", [review_service_1.ReviewService])
], ReviewController);
//# sourceMappingURL=review.controller.js.map