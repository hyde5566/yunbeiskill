"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SkillController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const swagger_1 = require("@nestjs/swagger");
const skill_service_1 = require("./skill.service");
const project_service_1 = require("../project/project.service");
const download_service_1 = require("../download/download.service");
const user_entity_1 = require("../user/entities/user.entity");
const skill_dto_1 = require("./dto/skill.dto");
const pagination_dto_1 = require("../../common/dto/pagination.dto");
const public_decorator_1 = require("../../common/decorators/public.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const fs = __importStar(require("fs"));
const uploadDest = process.env.UPLOAD_DEST || './uploads';
let SkillController = class SkillController {
    skillService;
    projectService;
    downloadService;
    userRepository;
    constructor(skillService, projectService, downloadService, userRepository) {
        this.skillService = skillService;
        this.projectService = projectService;
        this.downloadService = downloadService;
        this.userRepository = userRepository;
    }
    async findPublished(pagination, query, user) {
        const userProjectIds = await this.projectService.getUserProjectIds(user.id);
        return this.skillService.findPublished(pagination, query, user.id, user.permissions, userProjectIds);
    }
    findAll(pagination, query) {
        return this.skillService.findAll(pagination, query);
    }
    getMySubmissions(pagination, user) {
        return this.skillService.getMySubmissions(pagination, user.id);
    }
    findOne(id) {
        return this.skillService.findOne(id);
    }
    async create(createDto, zipFile, user) {
        if (!zipFile) {
            throw new common_1.BadRequestException('请上传Zip文件');
        }
        const zipPath = zipFile.path;
        const zipSize = zipFile.size;
        return this.skillService.create(createDto, user.id, zipPath, zipSize);
    }
    update(id, updateDto, user) {
        const isAdmin = user.permissions?.includes('admin');
        return this.skillService.update(id, updateDto, user.id, isAdmin);
    }
    submitVersion(id, dto, zipFile, user) {
        return this.skillService.submitVersion(id, dto, user.id, zipFile.path, zipFile.size);
    }
    getVersions(id) {
        return this.skillService.getVersions(id);
    }
    publish(id) {
        return this.skillService.publish(id);
    }
    offline(id) {
        return this.skillService.offline(id);
    }
    resubmit(id, user) {
        return this.skillService.resubmit(id, user.id);
    }
    async remove(id, user) {
        const isAdmin = user.permissions?.includes('admin');
        return this.skillService.remove(id, user.id, isAdmin);
    }
    async downloadZip(skillId, versionId, user, res) {
        const { filePath, fileName } = await this.skillService.getDownloadInfo(skillId, versionId);
        if (!fs.existsSync(filePath)) {
            throw new common_1.NotFoundException('文件不存在');
        }
        const dbUser = await this.userRepository.findOne({ where: { id: user.id } });
        if (dbUser) {
            await this.downloadService.recordDownload(user.id, skillId, versionId, dbUser.department_id);
        }
        res.download(filePath, fileName);
    }
};
exports.SkillController = SkillController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: '获取已发布Skill列表（检索中心）' }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Query)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_dto_1.PaginationDto,
        skill_dto_1.SkillQueryDto, Object]),
    __metadata("design:returntype", Promise)
], SkillController.prototype, "findPublished", null);
__decorate([
    (0, common_1.Get)('all'),
    (0, public_decorator_1.RequirePermission)('admin'),
    (0, swagger_1.ApiOperation)({ summary: '获取所有Skill列表（管理员）' }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_dto_1.PaginationDto,
        skill_dto_1.SkillQueryDto]),
    __metadata("design:returntype", void 0)
], SkillController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('my-submissions'),
    (0, swagger_1.ApiOperation)({ summary: '我的提交记录' }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_dto_1.PaginationDto, Object]),
    __metadata("design:returntype", void 0)
], SkillController.prototype, "getMySubmissions", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: '获取Skill详情' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], SkillController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: '提交新Skill' }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('zipFile', {
        dest: uploadDest,
        limits: { fileSize: 50 * 1024 * 1024 },
        fileFilter: (req, file, cb) => {
            if (file.originalname.endsWith('.zip')) {
                cb(null, true);
            }
            else {
                cb(new Error('只允许上传Zip文件'), false);
            }
        },
    })),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [skill_dto_1.CreateSkillDto, Object, Object]),
    __metadata("design:returntype", Promise)
], SkillController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: '编辑Skill' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, skill_dto_1.UpdateSkillDto, Object]),
    __metadata("design:returntype", void 0)
], SkillController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/versions'),
    (0, swagger_1.ApiOperation)({ summary: '提交新版本' }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('zipFile', {
        dest: uploadDest,
        limits: { fileSize: 50 * 1024 * 1024 },
        fileFilter: (req, file, cb) => {
            if (file.originalname.endsWith('.zip')) {
                cb(null, true);
            }
            else {
                cb(new Error('只允许上传Zip文件'), false);
            }
        },
    })),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFile)()),
    __param(3, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, skill_dto_1.SubmitVersionDto, Object, Object]),
    __metadata("design:returntype", void 0)
], SkillController.prototype, "submitVersion", null);
__decorate([
    (0, common_1.Get)(':id/versions'),
    (0, swagger_1.ApiOperation)({ summary: '获取版本列表' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], SkillController.prototype, "getVersions", null);
__decorate([
    (0, common_1.Post)(':id/publish'),
    (0, public_decorator_1.RequirePermission)('admin'),
    (0, swagger_1.ApiOperation)({ summary: '发布Skill' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], SkillController.prototype, "publish", null);
__decorate([
    (0, common_1.Post)(':id/offline'),
    (0, public_decorator_1.RequirePermission)('admin'),
    (0, swagger_1.ApiOperation)({ summary: '下架Skill' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], SkillController.prototype, "offline", null);
__decorate([
    (0, common_1.Post)(':id/resubmit'),
    (0, swagger_1.ApiOperation)({ summary: '重新提交审核' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], SkillController.prototype, "resubmit", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: '删除Skill' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], SkillController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)(':skillId/versions/:versionId/download'),
    (0, swagger_1.ApiOperation)({ summary: '下载Skill Zip包' }),
    __param(0, (0, common_1.Param)('skillId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('versionId', common_1.ParseIntPipe)),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __param(3, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Object, Object]),
    __metadata("design:returntype", Promise)
], SkillController.prototype, "downloadZip", null);
exports.SkillController = SkillController = __decorate([
    (0, swagger_1.ApiTags)('Skill管理'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('skills'),
    __param(3, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [skill_service_1.SkillService,
        project_service_1.ProjectService,
        download_service_1.DownloadService,
        typeorm_2.Repository])
], SkillController);
//# sourceMappingURL=skill.controller.js.map