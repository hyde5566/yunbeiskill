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
exports.AddProjectSkillDto = exports.AddProjectMembersDto = exports.UpdateProjectDto = exports.CreateProjectDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
class CreateProjectDto {
    name;
    description;
    owner_id;
}
exports.CreateProjectDto = CreateProjectDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '项目名称' }),
    (0, class_validator_1.IsNotEmpty)({ message: '项目名称不能为空' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateProjectDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '项目描述' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateProjectDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '项目负责人ID' }),
    (0, class_validator_1.IsNotEmpty)({ message: '项目负责人不能为空' }),
    (0, class_transformer_1.Transform)(({ value }) => { if (value === null || value === undefined || value === '')
        return undefined; return typeof value === 'string' ? parseInt(value, 10) : value; }),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateProjectDto.prototype, "owner_id", void 0);
class UpdateProjectDto {
    name;
    description;
    owner_id;
    status;
}
exports.UpdateProjectDto = UpdateProjectDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '项目名称' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateProjectDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '项目描述' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateProjectDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '项目负责人ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => { if (value === null || value === undefined || value === '')
        return undefined; return typeof value === 'string' ? parseInt(value, 10) : value; }),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], UpdateProjectDto.prototype, "owner_id", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '状态（active/archived）' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateProjectDto.prototype, "status", void 0);
class AddProjectMembersDto {
    user_ids;
}
exports.AddProjectMembersDto = AddProjectMembersDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '用户ID列表' }),
    (0, class_validator_1.IsNotEmpty)({ message: '用户列表不能为空' }),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], AddProjectMembersDto.prototype, "user_ids", void 0);
class AddProjectSkillDto {
    skill_ids;
}
exports.AddProjectSkillDto = AddProjectSkillDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'SkillID列表' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Skill列表不能为空' }),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], AddProjectSkillDto.prototype, "skill_ids", void 0);
//# sourceMappingURL=project.dto.js.map