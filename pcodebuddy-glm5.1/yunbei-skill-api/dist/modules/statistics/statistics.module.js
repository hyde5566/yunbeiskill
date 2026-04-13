"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatisticsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const statistics_controller_1 = require("./statistics.controller");
const statistics_service_1 = require("./statistics.service");
const skill_entity_1 = require("../skill/entities/skill.entity");
const user_entity_1 = require("../user/entities/user.entity");
const rating_entity_1 = require("../rating/entities/rating.entity");
const download_record_entity_1 = require("../download/entities/download-record.entity");
const review_entity_1 = require("../review/entities/review.entity");
const feedback_entity_1 = require("../feedback/entities/feedback.entity");
const project_entity_1 = require("../project/entities/project.entity");
const skill_category_entity_1 = require("../skill-category/entities/skill-category.entity");
let StatisticsModule = class StatisticsModule {
};
exports.StatisticsModule = StatisticsModule;
exports.StatisticsModule = StatisticsModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([skill_entity_1.Skill, user_entity_1.User, rating_entity_1.Rating, download_record_entity_1.DownloadRecord, review_entity_1.Review, feedback_entity_1.Feedback, project_entity_1.Project, skill_category_entity_1.SkillCategory])],
        controllers: [statistics_controller_1.StatisticsController],
        providers: [statistics_service_1.StatisticsService],
        exports: [statistics_service_1.StatisticsService],
    })
], StatisticsModule);
//# sourceMappingURL=statistics.module.js.map