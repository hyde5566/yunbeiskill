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
exports.SkillVersion = void 0;
const typeorm_1 = require("typeorm");
const swagger_1 = require("@nestjs/swagger");
const skill_entity_1 = require("./skill.entity");
const user_entity_1 = require("../../user/entities/user.entity");
let SkillVersion = class SkillVersion {
    id;
    skill_id;
    version_number;
    zip_path;
    zip_size;
    change_log;
    uploader_id;
    status;
    created_at;
    skill;
    uploader;
};
exports.SkillVersion = SkillVersion;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '版本ID' }),
    (0, typeorm_1.PrimaryGeneratedColumn)({ type: 'bigint' }),
    __metadata("design:type", Number)
], SkillVersion.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'SkillID' }),
    (0, typeorm_1.Column)({ type: 'bigint' }),
    __metadata("design:type", Number)
], SkillVersion.prototype, "skill_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '版本号' }),
    (0, typeorm_1.Column)({ length: 50 }),
    __metadata("design:type", String)
], SkillVersion.prototype, "version_number", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '文件存储路径' }),
    (0, typeorm_1.Column)({ length: 500 }),
    __metadata("design:type", String)
], SkillVersion.prototype, "zip_path", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '文件大小（字节）' }),
    (0, typeorm_1.Column)({ type: 'bigint' }),
    __metadata("design:type", Number)
], SkillVersion.prototype, "zip_size", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '更新日志' }),
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], SkillVersion.prototype, "change_log", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '上传人ID' }),
    (0, typeorm_1.Column)({ type: 'bigint' }),
    __metadata("design:type", Number)
], SkillVersion.prototype, "uploader_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '状态' }),
    (0, typeorm_1.Column)({ length: 50, default: 'pending_review' }),
    __metadata("design:type", String)
], SkillVersion.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], SkillVersion.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => skill_entity_1.Skill, (s) => s.versions),
    (0, typeorm_1.JoinColumn)({ name: 'skill_id' }),
    __metadata("design:type", skill_entity_1.Skill)
], SkillVersion.prototype, "skill", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'uploader_id' }),
    __metadata("design:type", user_entity_1.User)
], SkillVersion.prototype, "uploader", void 0);
exports.SkillVersion = SkillVersion = __decorate([
    (0, typeorm_1.Entity)('skill_versions')
], SkillVersion);
//# sourceMappingURL=skill-version.entity.js.map