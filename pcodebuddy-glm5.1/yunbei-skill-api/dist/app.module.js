"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const core_1 = require("@nestjs/core");
const auth_module_1 = require("./modules/auth/auth.module");
const user_module_1 = require("./modules/user/user.module");
const department_module_1 = require("./modules/department/department.module");
const permission_module_1 = require("./modules/permission/permission.module");
const project_module_1 = require("./modules/project/project.module");
const skill_category_module_1 = require("./modules/skill-category/skill-category.module");
const skill_module_1 = require("./modules/skill/skill.module");
const review_module_1 = require("./modules/review/review.module");
const rating_module_1 = require("./modules/rating/rating.module");
const feedback_module_1 = require("./modules/feedback/feedback.module");
const download_module_1 = require("./modules/download/download.module");
const notification_module_1 = require("./modules/notification/notification.module");
const statistics_module_1 = require("./modules/statistics/statistics.module");
const operation_log_module_1 = require("./modules/operation-log/operation-log.module");
const login_log_module_1 = require("./modules/login-log/login-log.module");
const jwt_auth_guard_1 = require("./common/guards/jwt-auth.guard");
const permission_guard_1 = require("./common/guards/permission.guard");
const database_config_1 = __importDefault(require("./config/database.config"));
const jwt_config_1 = __importDefault(require("./config/jwt.config"));
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                load: [database_config_1.default, jwt_config_1.default],
            }),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (config) => ({
                    type: 'mysql',
                    host: config.get('database.host'),
                    port: config.get('database.port'),
                    username: config.get('database.username'),
                    password: config.get('database.password'),
                    database: config.get('database.database'),
                    entities: [__dirname + '/**/*.entity{.ts,.js}'],
                    synchronize: false,
                    logging: true,
                }),
            }),
            auth_module_1.AuthModule,
            user_module_1.UserModule,
            department_module_1.DepartmentModule,
            permission_module_1.PermissionModule,
            project_module_1.ProjectModule,
            skill_category_module_1.SkillCategoryModule,
            skill_module_1.SkillModule,
            review_module_1.ReviewModule,
            rating_module_1.RatingModule,
            feedback_module_1.FeedbackModule,
            download_module_1.DownloadModule,
            notification_module_1.NotificationModule,
            statistics_module_1.StatisticsModule,
            operation_log_module_1.OperationLogModule,
            login_log_module_1.LoginLogModule,
        ],
        providers: [
            { provide: core_1.APP_GUARD, useClass: jwt_auth_guard_1.JwtAuthGuard },
            { provide: core_1.APP_GUARD, useClass: permission_guard_1.PermissionGuard },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map