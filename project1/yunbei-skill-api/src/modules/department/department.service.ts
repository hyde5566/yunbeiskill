import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Department } from './entities/department.entity'
import { CreateDeptDto } from './dto/create-dept.dto'
import { UpdateDeptDto } from './dto/update-dept.dto'
import { User } from '../user/entities/user.entity'

@Injectable()
export class DepartmentService {
  constructor(
    @InjectRepository(Department)
    private deptRepo: Repository<Department>,
    @InjectRepository(User)
    private userRepo: Repository<User>
  ) {}

  async create(dto: CreateDeptDto): Promise<Department> {
    let level = 1
    let parentId: number | null = null

    if (dto.parentId !== undefined && dto.parentId !== null) {
      const parent = await this.deptRepo.findOne({ where: { id: dto.parentId } })
      if (!parent) throw new NotFoundException('父部门不存在')
      level = parent.level + 1
      parentId = dto.parentId
    }

    const dept = this.deptRepo.create({
      name: dto.name,
      parentId,
      level,
      sortOrder: dto.sortOrder || 0
    })
    return this.deptRepo.save(dept)
  }

  async update(id: number, dto: UpdateDeptDto): Promise<Department> {
    const dept = await this.findById(id)
    if (dto.parentId !== undefined && dto.parentId !== null) {
      // 不能将自己设为自己的父部门
      if (dto.parentId === id) {
        throw new BadRequestException('不能将自己设为父部门')
      }
      // 检查是否会形成循环引用
      const parent = await this.deptRepo.findOne({ where: { id: dto.parentId } })
      if (!parent) throw new NotFoundException('父部门不存在')
      // 检查新父部门是否是当前部门的子部门
      const isChild = await this.isChildDepartment(dto.parentId, id)
      if (isChild) {
        throw new BadRequestException('不能将子部门设为父部门，会形成循环')
      }
      dept.level = parent.level + 1
      dept.parentId = dto.parentId
    }
    if (dto.name) dept.name = dto.name
    if (dto.sortOrder !== undefined) dept.sortOrder = dto.sortOrder
    return this.deptRepo.save(dept)
  }

  async findById(id: number): Promise<Department> {
    const dept = await this.deptRepo.findOne({ where: { id } })
    if (!dept) throw new NotFoundException('部门不存在')
    return dept
  }

  async remove(id: number): Promise<void> {
    // 检查是否有子部门
    const children = await this.deptRepo.find({ where: { parentId: id } })
    if (children.length > 0) {
      throw new NotFoundException('存在子部门，无法删除')
    }
    // 检查是否有用户关联
    const userCount = await this.userRepo.count({ where: { departmentId: id } })
    if (userCount > 0) {
      throw new BadRequestException('存在关联用户，无法删除')
    }
    const dept = await this.findById(id)
    await this.deptRepo.remove(dept)
  }

  async getTree(): Promise<any[]> {
    const all = await this.deptRepo.find({ order: { sortOrder: 'ASC' } })
    return this.buildTree(all, null)
  }

  private buildTree(items: Department[], parentId: number | null): any[] {
    return items
      .filter(item => item.parentId === parentId)
      .map(item => ({
        id: item.id,
        name: item.name,
        parentId: item.parentId,
        level: item.level,
        sortOrder: item.sortOrder,
        createdAt: item.createdAt,
        children: this.buildTree(items, item.id)
      }))
  }

  async list(): Promise<Department[]> {
    return this.deptRepo.find({ order: { sortOrder: 'ASC' } })
  }

  // 检查某个部门是否是另一个部门的子部门（包括多层嵌套）
  private async isChildDepartment(childId: number, parentId: number): Promise<boolean> {
    const children = await this.deptRepo.find({ where: { parentId } })
    for (const child of children) {
      if (child.id === childId) return true
      // 递归检查子部门的子部门
      const isNestedChild = await this.isChildDepartment(childId, child.id)
      if (isNestedChild) return true
    }
    return false
  }
}