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
const swagger_1 = require("@nestjs/swagger");
const skill_service_1 = require("./skill.service");
const skill_dto_1 = require("./dto/skill.dto");
const pagination_dto_1 = require("../../common/dto/pagination.dto");
const public_decorator_1 = require("../../common/decorators/public.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const fs = __importStar(require("fs"));
const uploadDest = process.env.UPLOAD_DEST || './uploads';
let SkillController = class SkillController {
    skillService;
    constructor(skillService) {
        this.skillService = skillService;
    }
    findPublished(pagination, query, user) {
        return this.skillService.findPublished(pagination, query, user.userId, user.permissions, []);
    }
    findAll(pagination, query) {
        return this.skillService.findAll(pagination, query);
    }
    getMySubmissions(pagination, user) {
        return this.skillService.getMySubmissions(pagination, user.userId);
    }
    findOne(id) {
        return this.skillService.findOne(id);
    }
    async create(createDto, zipFile, user) {
        const zipPath = zipFile.path;
        const zipSize = zipFile.size;
        return this.skillService.create(createDto, user.userId, zipPath, zipSize);
    }
    update(id, updateDto, user) {
        return this.skillService.update(id, updateDto, user.userId);
    }
    submitVersion(id, dto, zipFile, user) {
        return this.skillService.submitVersion(id, dto, user.userId, zipFile.path, zipFile.size);
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
    async downloadZip(skillId, versionId, res) {
        const { filePath, fileName } = await this.skillService.getDownloadInfo(skillId, versionId);
        if (!fs.existsSync(filePath)) {
            throw new common_1.NotFoundException('文件不存在');
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
    __metadata("design:returntype", void 0)
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
    (0, public_decorator_1.RequirePermission)('admin'),
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
    (0, common_1.Get)(':skillId/versions/:versionId/download'),
    (0, swagger_1.ApiOperation)({ summary: '下载Skill Zip包' }),
    __param(0, (0, common_1.Param)('skillId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('versionId', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Object]),
    __metadata("design:returntype", Promise)
], SkillController.prototype, "downloadZip", null);
exports.SkillController = SkillController = __decorate([
    (0, swagger_1.ApiTags)('Skill管理'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('skills'),
    __metadata("design:paramtypes", [skill_service_1.SkillService])
], SkillController);
//# sourceMappingURL=skill.controller.js.map