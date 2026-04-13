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
exports.UpdateSkillCategoryDto = exports.CreateSkillCategoryDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreateSkillCategoryDto {
    name;
    description;
    sort_order;
}
exports.CreateSkillCategoryDto = CreateSkillCategoryDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '分类名称' }),
    (0, class_validator_1.IsNotEmpty)({ message: '分类名称不能为空' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSkillCategoryDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '分类描述' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSkillCategoryDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '排序' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateSkillCategoryDto.prototype, "sort_order", void 0);
class UpdateSkillCategoryDto {
    name;
    description;
    sort_order;
}
exports.UpdateSkillCategoryDto = UpdateSkillCategoryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '分类名称' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateSkillCategoryDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '分类描述' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateSkillCategoryDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '排序' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateSkillCategoryDto.prototype, "sort_order", void 0);
//# sourceMappingURL=skill-category.dto.js.map