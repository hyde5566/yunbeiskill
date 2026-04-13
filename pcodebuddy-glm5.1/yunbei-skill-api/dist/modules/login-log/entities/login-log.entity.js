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
exports.LoginLog = void 0;
const typeorm_1 = require("typeorm");
const swagger_1 = require("@nestjs/swagger");
let LoginLog = class LoginLog {
    id;
    user_id;
    username;
    login_type;
    ip_address;
    device;
    status;
    created_at;
};
exports.LoginLog = LoginLog;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '日志ID' }),
    (0, typeorm_1.PrimaryGeneratedColumn)({ type: 'bigint' }),
    __metadata("design:type", Number)
], LoginLog.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '用户ID' }),
    (0, typeorm_1.Column)({ type: 'bigint' }),
    __metadata("design:type", Number)
], LoginLog.prototype, "user_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '账号' }),
    (0, typeorm_1.Column)({ length: 50 }),
    __metadata("design:type", String)
], LoginLog.prototype, "username", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '类型（login/logout）' }),
    (0, typeorm_1.Column)({ length: 50 }),
    __metadata("design:type", String)
], LoginLog.prototype, "login_type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'IP地址' }),
    (0, typeorm_1.Column)({ length: 50, nullable: true }),
    __metadata("design:type", String)
], LoginLog.prototype, "ip_address", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '设备信息' }),
    (0, typeorm_1.Column)({ length: 255, nullable: true }),
    __metadata("design:type", String)
], LoginLog.prototype, "device", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '状态（1=成功，0=失败）' }),
    (0, typeorm_1.Column)({ type: 'tinyint', default: 1 }),
    __metadata("design:type", Number)
], LoginLog.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], LoginLog.prototype, "created_at", void 0);
exports.LoginLog = LoginLog = __decorate([
    (0, typeorm_1.Entity)('login_logs')
], LoginLog);
//# sourceMappingURL=login-log.entity.js.map