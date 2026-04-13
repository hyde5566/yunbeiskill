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
exports.AssignPermissionsDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class AssignPermissionsDto {
    user_id;
    permission_codes;
}
exports.AssignPermissionsDto = AssignPermissionsDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '用户ID' }),
    (0, class_validator_1.IsNotEmpty)({ message: '用户ID不能为空' }),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], AssignPermissionsDto.prototype, "user_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '权限代码列表', example: ['basic', 'review'] }),
    (0, class_validator_1.IsNotEmpty)({ message: '权限列表不能为空' }),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], AssignPermissionsDto.prototype, "permission_codes", void 0);
//# sourceMappingURL=permission.dto.js.map