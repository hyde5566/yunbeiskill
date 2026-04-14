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
exports.DepartmentService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const department_entity_1 = require("./entities/department.entity");
let DepartmentService = class DepartmentService {
    departmentRepository;
    constructor(departmentRepository) {
        this.departmentRepository = departmentRepository;
    }
    async create(createDto) {
        let level = 1;
        if (createDto.parent_id) {
            const parent = await this.departmentRepository.findOne({
                where: { id: createDto.parent_id },
            });
            if (!parent) {
                throw new common_1.BadRequestException('父部门不存在');
            }
            level = parent.level + 1;
        }
        const department = this.departmentRepository.create({
            ...createDto,
            level,
        });
        return this.departmentRepository.save(department);
    }
    async findAll() {
        return this.departmentRepository.find({
            order: { sort_order: 'ASC', id: 'ASC' },
        });
    }
    async getTree() {
        const departments = await this.findAll();
        return this.buildTree(departments);
    }
    buildTree(departments, parentId = null) {
        return departments
            .filter((d) => Number(d.parent_id) === Number(parentId))
            .map((d) => ({
            ...d,
            children: this.buildTree(departments, d.id),
        }));
    }
    async findOne(id) {
        const department = await this.departmentRepository.findOne({ where: { id } });
        if (!department) {
            throw new common_1.NotFoundException('部门不存在');
        }
        return department;
    }
    async update(id, updateDto) {
        const department = await this.findOne(id);
        if (updateDto.parent_id !== undefined) {
            if (Number(updateDto.parent_id) === Number(id)) {
                throw new common_1.BadRequestException('不能将自己设为父部门');
            }
            if (updateDto.parent_id) {
                const parent = await this.departmentRepository.findOne({
                    where: { id: updateDto.parent_id },
                });
                if (!parent) {
                    throw new common_1.BadRequestException('父部门不存在');
                }
                department.level = parent.level + 1;
            }
        }
        Object.assign(department, updateDto);
        return this.departmentRepository.save(department);
    }
    async remove(id) {
        const department = await this.findOne(id);
        const children = await this.departmentRepository.find({
            where: { parent_id: id },
        });
        if (children.length > 0) {
            throw new common_1.BadRequestException('该部门下有子部门，无法删除');
        }
        await this.departmentRepository.remove(department);
    }
    async getMembers(departmentId) {
        const dept = await this.findOne(departmentId);
        const childDepts = await this.getAllChildIds(departmentId);
        const allDeptIds = [departmentId, ...childDepts];
        const users = await this.departmentRepository.manager
            .createQueryBuilder()
            .from('users', 'user')
            .where('user.department_id IN (:...deptIds)', { deptIds: allDeptIds })
            .andWhere('user.status = 1')
            .getRawMany();
        return users;
    }
    async getAllChildIds(parentId) {
        const children = await this.departmentRepository.find({
            where: { parent_id: parentId },
        });
        let ids = children.map((c) => c.id);
        for (const child of children) {
            const childIds = await this.getAllChildIds(child.id);
            ids = ids.concat(childIds);
        }
        return ids;
    }
};
exports.DepartmentService = DepartmentService;
exports.DepartmentService = DepartmentService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(department_entity_1.Department)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], DepartmentService);
//# sourceMappingURL=department.service.js.map