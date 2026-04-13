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
exports.PermissionService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const permission_entity_1 = require("./entities/permission.entity");
const user_permission_entity_1 = require("./entities/user-permission.entity");
let PermissionService = class PermissionService {
    permissionRepository;
    userPermissionRepository;
    constructor(permissionRepository, userPermissionRepository) {
        this.permissionRepository = permissionRepository;
        this.userPermissionRepository = userPermissionRepository;
    }
    async findAll() {
        return this.permissionRepository.find();
    }
    async getUserPermissions(userId) {
        const userPermissions = await this.userPermissionRepository.find({
            where: { user_id: userId },
            relations: ['permission'],
        });
        return userPermissions.map((up) => up.permission);
    }
    async assignPermissions(assignDto, assignedBy) {
        const { user_id, permission_codes } = assignDto;
        const allPermissions = await this.permissionRepository.find();
        const permissionMap = new Map(allPermissions.map((p) => [p.code, p]));
        await this.userPermissionRepository.delete({ user_id });
        for (const code of permission_codes) {
            const permission = permissionMap.get(code);
            if (permission) {
                const userPermission = this.userPermissionRepository.create({
                    user_id,
                    permission_id: permission.id,
                    assigned_by: assignedBy,
                });
                await this.userPermissionRepository.save(userPermission);
            }
        }
    }
};
exports.PermissionService = PermissionService;
exports.PermissionService = PermissionService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(permission_entity_1.Permission)),
    __param(1, (0, typeorm_1.InjectRepository)(user_permission_entity_1.UserPermission)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], PermissionService);
//# sourceMappingURL=permission.service.js.map