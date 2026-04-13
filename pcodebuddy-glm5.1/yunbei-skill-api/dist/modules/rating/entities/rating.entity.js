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
exports.Rating = void 0;
const typeorm_1 = require("typeorm");
const swagger_1 = require("@nestjs/swagger");
const user_entity_1 = require("../../user/entities/user.entity");
const skill_entity_1 = require("../../skill/entities/skill.entity");
const skill_version_entity_1 = require("../../skill/entities/skill-version.entity");
let Rating = class Rating {
    id;
    user_id;
    skill_id;
    version_id;
    score;
    created_at;
    user;
    skill;
    version;
};
exports.Rating = Rating;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '评分ID' }),
    (0, typeorm_1.PrimaryGeneratedColumn)({ type: 'bigint' }),
    __metadata("design:type", Number)
], Rating.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '评分人ID' }),
    (0, typeorm_1.Column)({ type: 'bigint' }),
    __metadata("design:type", Number)
], Rating.prototype, "user_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'SkillID' }),
    (0, typeorm_1.Column)({ type: 'bigint' }),
    __metadata("design:type", Number)
], Rating.prototype, "skill_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '版本ID' }),
    (0, typeorm_1.Column)({ type: 'bigint' }),
    __metadata("design:type", Number)
], Rating.prototype, "version_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '评分（1-5）' }),
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], Rating.prototype, "score", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Rating.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], Rating.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => skill_entity_1.Skill),
    (0, typeorm_1.JoinColumn)({ name: 'skill_id' }),
    __metadata("design:type", skill_entity_1.Skill)
], Rating.prototype, "skill", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => skill_version_entity_1.SkillVersion),
    (0, typeorm_1.JoinColumn)({ name: 'version_id' }),
    __metadata("design:type", skill_version_entity_1.SkillVersion)
], Rating.prototype, "version", void 0);
exports.Rating = Rating = __decorate([
    (0, typeorm_1.Entity)('ratings')
], Rating);
//# sourceMappingURL=rating.entity.js.map