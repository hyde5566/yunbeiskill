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
exports.OperationLogController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const operation_log_service_1 = require("./operation-log.service");
const pagination_dto_1 = require("../../common/dto/pagination.dto");
const public_decorator_1 = require("../../common/decorators/public.decorator");
let OperationLogController = class OperationLogController {
    operationLogService;
    constructor(operationLogService) {
        this.operationLogService = operationLogService;
    }
    findAll(pagination, module, startDate, endDate) {
        return this.operationLogService.findAll(pagination, module, startDate, endDate);
    }
};
exports.OperationLogController = OperationLogController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: '获取操作日志列表' }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Query)('module')),
    __param(2, (0, common_1.Query)('startDate')),
    __param(3, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_dto_1.PaginationDto, String, String, String]),
    __metadata("design:returntype", void 0)
], OperationLogController.prototype, "findAll", null);
exports.OperationLogController = OperationLogController = __decorate([
    (0, swagger_1.ApiTags)('操作日志'),
    (0, common_1.Controller)('operation-logs'),
    (0, public_decorator_1.RequirePermission)('admin'),
    __metadata("design:paramtypes", [operation_log_service_1.OperationLogService])
], OperationLogController);
//# sourceMappingURL=operation-log.controller.js.map