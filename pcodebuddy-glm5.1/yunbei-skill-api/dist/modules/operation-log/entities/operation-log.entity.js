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
Object.defineProperty(exports, "__esModule", { value: true });
exports.OperationLog = void 0;
const typeorm_1 = require("typeorm");
const swagger_1 = require("@nestjs/swagger");
const user_entity_1 = require("../../user/entities/user.entity");
let OperationLog = class OperationLog {
    id;
    user_id;
    module;
    action;
    target_type;
    target_id;
    detail;
    ip_address;
    created_at;
    user;
};
exports.OperationLog = OperationLog;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '日志ID' }),
    (0, typeorm_1.PrimaryGeneratedColumn)({ type: 'bigint' }),
    __metadata("design:type", Number)
], OperationLog.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '操作人ID' }),
    (0, typeorm_1.Column)({ type: 'bigint' }),
    __metadata("design:type", Number)
], OperationLog.prototype, "user_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '模块' }),
    (0, typeorm_1.Column)({ length: 100 }),
    __metadata("design:type", String)
], OperationLog.prototype, "module", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '动作' }),
    (0, typeorm_1.Column)({ length: 100 }),
    __metadata("design:type", String)
], OperationLog.prototype, "action", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '目标类型' }),
    (0, typeorm_1.Column)({ length: 100, nullable: true }),
    __metadata("design:type", String)
], OperationLog.prototype, "target_type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '目标ID' }),
    (0, typeorm_1.Column)({ type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], OperationLog.prototype, "target_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '操作详情' }),
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], OperationLog.prototype, "detail", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'IP地址' }),
    (0, typeorm_1.Column)({ length: 50, nullable: true }),
    __metadata("design:type", String)
], OperationLog.prototype, "ip_address", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], OperationLog.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], OperationLog.prototype, "user", void 0);
exports.OperationLog = OperationLog = __decorate([
    (0, typeorm_1.Entity)('operation_logs')
], OperationLog);
//# sourceMappingURL=operation-log.entity.js.map