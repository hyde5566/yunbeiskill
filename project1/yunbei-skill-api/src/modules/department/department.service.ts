import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Department } from './entities/department.entity'
import { CreateDeptDto } from './dto/create-dept.dto'
import { UpdateDeptDto } from './dto/update-dept.dto'

@Injectable()
export class DepartmentService {
  constructor(
    @InjectRepository(Department)
    private deptRepo: Repository<Department>
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
      const parent = await this.deptRepo.findOne({ where: { id: dto.parentId } })
      if (!parent) throw new NotFoundException('父部门不存在')
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
}