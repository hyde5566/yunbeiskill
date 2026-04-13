"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SkillCategoryModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const skill_category_controller_1 = require("./skill-category.controller");
const skill_category_service_1 = require("./skill-category.service");
const skill_category_entity_1 = require("./entities/skill-category.entity");
let SkillCategoryModule = class SkillCategoryModule {
};
exports.SkillCategoryModule = SkillCategoryModule;
exports.SkillCategoryModule = SkillCategoryModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([skill_category_entity_1.SkillCategory])],
        controllers: [skill_category_controller_1.SkillCategoryController],
        providers: [skill_category_service_1.SkillCategoryService],
        exports: [skill_category_service_1.SkillCategoryService],
    })
], SkillCategoryModule);
//# sourceMappingURL=skill-category.module.js.map