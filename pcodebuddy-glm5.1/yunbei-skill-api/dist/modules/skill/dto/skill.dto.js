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
exports.SkillQueryDto = exports.SubmitVersionDto = exports.UpdateSkillDto = exports.CreateSkillDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreateSkillDto {
    name;
    summary;
    detail;
    author;
    category_id;
    source_type;
    source_url;
    source_url_name;
    project_ids;
    visibility_type;
    visibility_account_ids;
    version_number;
    change_log;
}
exports.CreateSkillDto = CreateSkillDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Skill名称' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Skill名称不能为空' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSkillDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '简介' }),
    (0, class_validator_1.IsNotEmpty)({ message: '简介不能为空' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSkillDto.prototype, "summary", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '详细说明' }),
    (0, class_validator_1.IsNotEmpty)({ message: '详细说明不能为空' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSkillDto.prototype, "detail", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '作者' }),
    (0, class_validator_1.IsNotEmpty)({ message: '作者不能为空' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSkillDto.prototype, "author", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '分类ID' }),
    (0, class_validator_1.IsNotEmpty)({ message: '分类不能为空' }),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateSkillDto.prototype, "category_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '来源类型（internal/external）' }),
    (0, class_validator_1.IsNotEmpty)({ message: '来源类型不能为空' }),
    (0, class_validator_1.IsEnum)(['internal', 'external']),
    __metadata("design:type", String)
], CreateSkillDto.prototype, "source_type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '来源网址（外部平台时必填）' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSkillDto.prototype, "source_url", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '来源网址名称' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSkillDto.prototype, "source_url_name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '关联项目ID列表' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], CreateSkillDto.prototype, "project_ids", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '可见范围类型（all/project/account）' }),
    (0, class_validator_1.IsNotEmpty)({ message: '可见范围不能为空' }),
    (0, class_validator_1.IsEnum)(['all', 'project', 'account']),
    __metadata("design:type", String)
], CreateSkillDto.prototype, "visibility_type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '可见账号ID列表（指定账号可见时必填）' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], CreateSkillDto.prototype, "visibility_account_ids", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '版本号' }),
    (0, class_validator_1.IsNotEmpty)({ message: '版本号不能为空' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSkillDto.prototype, "version_number", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '更新说明' }),
    (0, class_validator_1.IsNotEmpty)({ message: '更新说明不能为空' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSkillDto.prototype, "change_log", void 0);
class UpdateSkillDto {
    name;
    summary;
    detail;
    author;
    category_id;
    source_type;
    source_url;
    source_url_name;
    project_ids;
    visibility_type;
    visibility_account_ids;
}
exports.UpdateSkillDto = UpdateSkillDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Skill名称' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateSkillDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '简介' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateSkillDto.prototype, "summary", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '详细说明' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateSkillDto.prototype, "detail", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '作者' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateSkillDto.prototype, "author", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '分类ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], UpdateSkillDto.prototype, "category_id", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '来源类型' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['internal', 'external']),
    __metadata("design:type", String)
], UpdateSkillDto.prototype, "source_type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '来源网址' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateSkillDto.prototype, "source_url", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '来源网址名称' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateSkillDto.prototype, "source_url_name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '关联项目ID列表' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], UpdateSkillDto.prototype, "project_ids", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '可见范围类型' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['all', 'project', 'account']),
    __metadata("design:type", String)
], UpdateSkillDto.prototype, "visibility_type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '可见账号ID列表' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], UpdateSkillDto.prototype, "visibility_account_ids", void 0);
class SubmitVersionDto {
    version_number;
    change_log;
}
exports.SubmitVersionDto = SubmitVersionDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '版本号' }),
    (0, class_validator_1.IsNotEmpty)({ message: '版本号不能为空' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SubmitVersionDto.prototype, "version_number", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '更新说明' }),
    (0, class_validator_1.IsNotEmpty)({ message: '更新说明不能为空' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SubmitVersionDto.prototype, "change_log", void 0);
class SkillQueryDto {
    keyword;
    category_id;
    source_type;
    status;
}
exports.SkillQueryDto = SkillQueryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '关键词搜索' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SkillQueryDto.prototype, "keyword", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '分类ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], SkillQueryDto.prototype, "category_id", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '来源类型' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['internal', 'external']),
    __metadata("design:type", String)
], SkillQueryDto.prototype, "source_type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '状态' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SkillQueryDto.prototype, "status", void 0);
//# sourceMappingURL=skill.dto.js.map