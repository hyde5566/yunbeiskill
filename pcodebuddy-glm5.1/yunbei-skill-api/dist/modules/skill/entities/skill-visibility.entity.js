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
exports.SkillVisibility = void 0;
const typeorm_1 = require("typeorm");
const swagger_1 = require("@nestjs/swagger");
const skill_entity_1 = require("./skill.entity");
let SkillVisibility = class SkillVisibility {
    id;
    skill_id;
    target_type;
    target_id;
    created_at;
    skill;
};
exports.SkillVisibility = SkillVisibility;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ type: 'bigint' }),
    __metadata("design:type", Number)
], SkillVisibility.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'SkillID' }),
    (0, typeorm_1.Column)({ type: 'bigint' }),
    __metadata("design:type", Number)
], SkillVisibility.prototype, "skill_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '目标类型（project/account）' }),
    (0, typeorm_1.Column)({ length: 50 }),
    __metadata("design:type", String)
], SkillVisibility.prototype, "target_type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '目标ID（项目ID或用户ID）' }),
    (0, typeorm_1.Column)({ type: 'bigint' }),
    __metadata("design:type", Number)
], SkillVisibility.prototype, "target_id", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], SkillVisibility.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => skill_entity_1.Skill, (s) => s.visibilityList),
    (0, typeorm_1.JoinColumn)({ name: 'skill_id' }),
    __metadata("design:type", skill_entity_1.Skill)
], SkillVisibility.prototype, "skill", void 0);
exports.SkillVisibility = SkillVisibility = __decorate([
    (0, typeorm_1.Entity)('skill_visibility')
], SkillVisibility);
//# sourceMappingURL=skill-visibility.entity.js.map