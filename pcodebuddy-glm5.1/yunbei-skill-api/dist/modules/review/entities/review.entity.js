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
exports.Review = void 0;
const typeorm_1 = require("typeorm");
const swagger_1 = require("@nestjs/swagger");
const skill_entity_1 = require("../../skill/entities/skill.entity");
const skill_version_entity_1 = require("../../skill/entities/skill-version.entity");
const user_entity_1 = require("../../user/entities/user.entity");
let Review = class Review {
    id;
    skill_id;
    version_id;
    reviewer_id;
    assigned_by;
    status;
    comment;
    reviewed_at;
    created_at;
    skill;
    version;
    reviewer;
    assigner;
};
exports.Review = Review;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '审核ID' }),
    (0, typeorm_1.PrimaryGeneratedColumn)({ type: 'bigint' }),
    __metadata("design:type", Number)
], Review.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'SkillID' }),
    (0, typeorm_1.Column)({ type: 'bigint' }),
    __metadata("design:type", Number)
], Review.prototype, "skill_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '版本ID' }),
    (0, typeorm_1.Column)({ type: 'bigint' }),
    __metadata("design:type", Number)
], Review.prototype, "version_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '审核人ID（未分配时为null）' }),
    (0, typeorm_1.Column)({ type: 'bigint', nullable: true }),
    __metadata("design:type", Object)
], Review.prototype, "reviewer_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '分配人ID' }),
    (0, typeorm_1.Column)({ type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], Review.prototype, "assigned_by", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '状态（pending/approved/rejected）' }),
    (0, typeorm_1.Column)({ length: 50 }),
    __metadata("design:type", String)
], Review.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '审核意见' }),
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Review.prototype, "comment", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '审核时间' }),
    (0, typeorm_1.Column)({ type: 'datetime', nullable: true }),
    __metadata("design:type", Date)
], Review.prototype, "reviewed_at", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Review.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => skill_entity_1.Skill),
    (0, typeorm_1.JoinColumn)({ name: 'skill_id' }),
    __metadata("design:type", skill_entity_1.Skill)
], Review.prototype, "skill", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => skill_version_entity_1.SkillVersion),
    (0, typeorm_1.JoinColumn)({ name: 'version_id' }),
    __metadata("design:type", skill_version_entity_1.SkillVersion)
], Review.prototype, "version", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'reviewer_id' }),
    __metadata("design:type", user_entity_1.User)
], Review.prototype, "reviewer", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'assigned_by' }),
    __metadata("design:type", user_entity_1.User)
], Review.prototype, "assigner", void 0);
exports.Review = Review = __decorate([
    (0, typeorm_1.Entity)('reviews')
], Review);
//# sourceMappingURL=review.entity.js.map