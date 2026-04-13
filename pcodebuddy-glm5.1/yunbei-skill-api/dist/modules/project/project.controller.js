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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const project_service_1 = require("./project.service");
const project_dto_1 = require("./dto/project.dto");
const pagination_dto_1 = require("../../common/dto/pagination.dto");
const public_decorator_1 = require("../../common/decorators/public.decorator");
let ProjectController = class ProjectController {
    projectService;
    constructor(projectService) {
        this.projectService = projectService;
    }
    findAll(pagination, keyword) {
        return this.projectService.findAll(pagination, keyword);
    }
    findOne(id) {
        return this.projectService.findOne(id);
    }
    getMembers(id) {
        return this.projectService.getMembers(id);
    }
    create(createDto) {
        return this.projectService.create(createDto);
    }
    update(id, updateDto) {
        return this.projectService.update(id, updateDto);
    }
    remove(id) {
        return this.projectService.remove(id);
    }
    addMembers(id, dto) {
        return this.projectService.addMembers(id, dto);
    }
    removeMember(id, userId) {
        return this.projectService.removeMember(id, userId);
    }
    addSkills(id, dto) {
        return this.projectService.addSkills(id, dto);
    }
    removeSkill(id, skillId) {
        return this.projectService.removeSkill(id, skillId);
    }
};
exports.ProjectController = ProjectController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: '获取项目列表' }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Query)('keyword')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_dto_1.PaginationDto, String]),
    __metadata("design:returntype", void 0)
], ProjectController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: '获取项目详情' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ProjectController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)(':id/members'),
    (0, swagger_1.ApiOperation)({ summary: '获取项目成员' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ProjectController.prototype, "getMembers", null);
__decorate([
    (0, common_1.Post)(),
    (0, public_decorator_1.RequirePermission)('admin'),
    (0, swagger_1.ApiOperation)({ summary: '创建项目' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [project_dto_1.CreateProjectDto]),
    __metadata("design:returntype", void 0)
], ProjectController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, public_decorator_1.RequirePermission)('admin'),
    (0, swagger_1.ApiOperation)({ summary: '更新项目' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, project_dto_1.UpdateProjectDto]),
    __metadata("design:returntype", void 0)
], ProjectController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, public_decorator_1.RequirePermission)('admin'),
    (0, swagger_1.ApiOperation)({ summary: '删除项目' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ProjectController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/members'),
    (0, public_decorator_1.RequirePermission)('admin'),
    (0, swagger_1.ApiOperation)({ summary: '添加项目成员' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, project_dto_1.AddProjectMembersDto]),
    __metadata("design:returntype", void 0)
], ProjectController.prototype, "addMembers", null);
__decorate([
    (0, common_1.Delete)(':id/members/:userId'),
    (0, public_decorator_1.RequirePermission)('admin'),
    (0, swagger_1.ApiOperation)({ summary: '移除项目成员' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('userId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], ProjectController.prototype, "removeMember", null);
__decorate([
    (0, common_1.Post)(':id/skills'),
    (0, public_decorator_1.RequirePermission)('admin'),
    (0, swagger_1.ApiOperation)({ summary: '关联Skill' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, project_dto_1.AddProjectSkillDto]),
    __metadata("design:returntype", void 0)
], ProjectController.prototype, "addSkills", null);
__decorate([
    (0, common_1.Delete)(':id/skills/:skillId'),
    (0, public_decorator_1.RequirePermission)('admin'),
    (0, swagger_1.ApiOperation)({ summary: '取消关联Skill' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('skillId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], ProjectController.prototype, "removeSkill", null);
exports.ProjectController = ProjectController = __decorate([
    (0, swagger_1.ApiTags)('项目管理'),
    (0, common_1.Controller)('projects'),
    __metadata("design:paramtypes", [project_service_1.ProjectService])
], ProjectController);
//# sourceMappingURL=project.controller.js.map