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
exports.DownloadRecord = void 0;
const typeorm_1 = require("typeorm");
const swagger_1 = require("@nestjs/swagger");
const user_entity_1 = require("../../user/entities/user.entity");
const skill_entity_1 = require("../../skill/entities/skill.entity");
const skill_version_entity_1 = require("../../skill/entities/skill-version.entity");
const department_entity_1 = require("../../department/entities/department.entity");
let DownloadRecord = class DownloadRecord {
    id;
    user_id;
    skill_id;
    version_id;
    department_id;
    downloaded_at;
    user;
    skill;
    version;
    department;
};
exports.DownloadRecord = DownloadRecord;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '记录ID' }),
    (0, typeorm_1.PrimaryGeneratedColumn)({ type: 'bigint' }),
    __metadata("design:type", Number)
], DownloadRecord.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '下载人ID' }),
    (0, typeorm_1.Column)({ type: 'bigint' }),
    __metadata("design:type", Number)
], DownloadRecord.prototype, "user_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'SkillID' }),
    (0, typeorm_1.Column)({ type: 'bigint' }),
    __metadata("design:type", Number)
], DownloadRecord.prototype, "skill_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '版本ID' }),
    (0, typeorm_1.Column)({ type: 'bigint' }),
    __metadata("design:type", Number)
], DownloadRecord.prototype, "version_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '下载人所属部门ID' }),
    (0, typeorm_1.Column)({ type: 'bigint' }),
    __metadata("design:type", Number)
], DownloadRecord.prototype, "department_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '下载时间' }),
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], DownloadRecord.prototype, "downloaded_at", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], DownloadRecord.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => skill_entity_1.Skill),
    (0, typeorm_1.JoinColumn)({ name: 'skill_id' }),
    __metadata("design:type", skill_entity_1.Skill)
], DownloadRecord.prototype, "skill", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => skill_version_entity_1.SkillVersion),
    (0, typeorm_1.JoinColumn)({ name: 'version_id' }),
    __metadata("design:type", skill_version_entity_1.SkillVersion)
], DownloadRecord.prototype, "version", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => department_entity_1.Department),
    (0, typeorm_1.JoinColumn)({ name: 'department_id' }),
    __metadata("design:type", department_entity_1.Department)
], DownloadRecord.prototype, "department", void 0);
exports.DownloadRecord = DownloadRecord = __decorate([
    (0, typeorm_1.Entity)('download_records')
], DownloadRecord);
//# sourceMappingURL=download-record.entity.js.map