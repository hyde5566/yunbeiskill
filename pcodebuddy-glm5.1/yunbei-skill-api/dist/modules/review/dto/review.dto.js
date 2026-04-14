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
exports.ReviewActionDto = exports.AssignReviewerDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
class AssignReviewerDto {
    skill_id;
    version_id;
    reviewer_id;
}
exports.AssignReviewerDto = AssignReviewerDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'SkillID' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_transformer_1.Transform)(({ value }) => { if (value === null || value === undefined || value === '')
        return undefined; return typeof value === 'string' ? parseInt(value, 10) : value; }),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], AssignReviewerDto.prototype, "skill_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '版本ID' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_transformer_1.Transform)(({ value }) => { if (value === null || value === undefined || value === '')
        return undefined; return typeof value === 'string' ? parseInt(value, 10) : value; }),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], AssignReviewerDto.prototype, "version_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '审核员ID' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_transformer_1.Transform)(({ value }) => { if (value === null || value === undefined || value === '')
        return undefined; return typeof value === 'string' ? parseInt(value, 10) : value; }),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], AssignReviewerDto.prototype, "reviewer_id", void 0);
class ReviewActionDto {
    status;
    comment;
}
exports.ReviewActionDto = ReviewActionDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '审核结果（approved/rejected）' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsEnum)(['approved', 'rejected']),
    __metadata("design:type", String)
], ReviewActionDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '审核意见' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReviewActionDto.prototype, "comment", void 0);
//# sourceMappingURL=review.dto.js.map