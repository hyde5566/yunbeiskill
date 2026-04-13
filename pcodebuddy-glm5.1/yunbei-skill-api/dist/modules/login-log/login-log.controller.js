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
exports.LoginLogController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const login_log_service_1 = require("./login-log.service");
const pagination_dto_1 = require("../../common/dto/pagination.dto");
const public_decorator_1 = require("../../common/decorators/public.decorator");
let LoginLogController = class LoginLogController {
    loginLogService;
    constructor(loginLogService) {
        this.loginLogService = loginLogService;
    }
    findAll(pagination, startDate, endDate) {
        return this.loginLogService.findAll(pagination, startDate, endDate);
    }
};
exports.LoginLogController = LoginLogController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: '获取登录日志列表' }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_dto_1.PaginationDto, String, String]),
    __metadata("design:returntype", void 0)
], LoginLogController.prototype, "findAll", null);
exports.LoginLogController = LoginLogController = __decorate([
    (0, swagger_1.ApiTags)('登录日志'),
    (0, common_1.Controller)('login-logs'),
    (0, public_decorator_1.RequirePermission)('admin'),
    __metadata("design:paramtypes", [login_log_service_1.LoginLogService])
], LoginLogController);
//# sourceMappingURL=login-log.controller.js.map