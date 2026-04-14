"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SkillModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const skill_controller_1 = require("./skill.controller");
const skill_service_1 = require("./skill.service");
const skill_entity_1 = require("./entities/skill.entity");
const skill_version_entity_1 = require("./entities/skill-version.entity");
const skill_visibility_entity_1 = require("./entities/skill-visibility.entity");
const project_skill_entity_1 = require("../project/entities/project-skill.entity");
const project_module_1 = require("../project/project.module");
const download_module_1 = require("../download/download.module");
const user_entity_1 = require("../user/entities/user.entity");
const review_entity_1 = require("../review/entities/review.entity");
let SkillModule = class SkillModule {
};
exports.SkillModule = SkillModule;
exports.SkillModule = SkillModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([skill_entity_1.Skill, skill_version_entity_1.SkillVersion, skill_visibility_entity_1.SkillVisibility, project_skill_entity_1.ProjectSkill, user_entity_1.User, review_entity_1.Review]),
            project_module_1.ProjectModule,
            download_module_1.DownloadModule,
        ],
        controllers: [skill_controller_1.SkillController],
        providers: [skill_service_1.SkillService],
        exports: [skill_service_1.SkillService],
    })
], SkillModule);
//# sourceMappingURL=skill.module.js.map