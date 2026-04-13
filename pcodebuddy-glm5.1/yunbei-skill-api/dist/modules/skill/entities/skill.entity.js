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
exports.Skill = void 0;
const typeorm_1 = require("typeorm");
const swagger_1 = require("@nestjs/swagger");
const skill_category_entity_1 = require("../../skill-category/entities/skill-category.entity");
const user_entity_1 = require("../../user/entities/user.entity");
const skill_version_entity_1 = require("./skill-version.entity");
const skill_visibility_entity_1 = require("./skill-visibility.entity");
let Skill = class Skill {
    id;
    unique_id;
    name;
    summary;
    detail;
    author;
    category_id;
    source_type;
    source_url;
    source_url_name;
    submitter_id;
    status;
    visibility_type;
    created_at;
    updated_at;
    category;
    submitter;
    versions;
    visibilityList;
};
exports.Skill = Skill;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Skill ID' }),
    (0, typeorm_1.PrimaryGeneratedColumn)({ type: 'bigint' }),
    __metadata("design:type", Number)
], Skill.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Skill唯一标识' }),
    (0, typeorm_1.Column)({ length: 100, unique: true }),
    __metadata("design:type", String)
], Skill.prototype, "unique_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Skill名称' }),
    (0, typeorm_1.Column)({ length: 200 }),
    __metadata("design:type", String)
], Skill.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '简介' }),
    (0, typeorm_1.Column)({ length: 200 }),
    __metadata("design:type", String)
], Skill.prototype, "summary", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '详细说明' }),
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Skill.prototype, "detail", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '作者' }),
    (0, typeorm_1.Column)({ length: 200 }),
    __metadata("design:type", String)
], Skill.prototype, "author", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '分类ID' }),
    (0, typeorm_1.Column)({ type: 'bigint' }),
    __metadata("design:type", Number)
], Skill.prototype, "category_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '来源类型（internal/external）' }),
    (0, typeorm_1.Column)({ length: 50 }),
    __metadata("design:type", String)
], Skill.prototype, "source_type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '来源网址' }),
    (0, typeorm_1.Column)({ length: 500, nullable: true }),
    __metadata("design:type", String)
], Skill.prototype, "source_url", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '来源网址名称' }),
    (0, typeorm_1.Column)({ length: 200, nullable: true }),
    __metadata("design:type", String)
], Skill.prototype, "source_url_name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '提交人ID' }),
    (0, typeorm_1.Column)({ type: 'bigint' }),
    __metadata("design:type", Number)
], Skill.prototype, "submitter_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '状态' }),
    (0, typeorm_1.Column)({ length: 50, default: 'pending_review' }),
    __metadata("design:type", String)
], Skill.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '可见范围类型（all/project/account）' }),
    (0, typeorm_1.Column)({ length: 50, default: 'all' }),
    __metadata("design:type", String)
], Skill.prototype, "visibility_type", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Skill.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Skill.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => skill_category_entity_1.SkillCategory),
    (0, typeorm_1.JoinColumn)({ name: 'category_id' }),
    __metadata("design:type", skill_category_entity_1.SkillCategory)
], Skill.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'submitter_id' }),
    __metadata("design:type", user_entity_1.User)
], Skill.prototype, "submitter", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => skill_version_entity_1.SkillVersion, (v) => v.skill),
    __metadata("design:type", Array)
], Skill.prototype, "versions", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => skill_visibility_entity_1.SkillVisibility, (v) => v.skill),
    __metadata("design:type", Array)
], Skill.prototype, "visibilityList", void 0);
exports.Skill = Skill = __decorate([
    (0, typeorm_1.Entity)('skills')
], Skill);
//# sourceMappingURL=skill.entity.js.map