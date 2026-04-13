import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Department } from './entities/department.entity'
import { CreateDepartmentDto, UpdateDepartmentDto } from './dto/department.dto'

@Injectable()
export class DepartmentService {
  constructor(
    @InjectRepository(Department)
    private departmentRepository: Repository<Department>,
  ) {}

  async create(createDto: CreateDepartmentDto): Promise<Department> {
    let level = 1
    if (createDto.parent_id) {
      const parent = await this.departmentRepository.findOne({
        where: { id: createDto.parent_id },
      })
      if (!parent) {
        throw new BadRequestException('父部门不存在')
      }
      level = parent.level + 1
    }

    const department = this.departmentRepository.create({
      ...createDto,
      level,
    })
    return this.departmentRepository.save(department)
  }

  async findAll(): Promise<Department[]> {
    return this.departmentRepository.find({
      order: { sort_order: 'ASC', id: 'ASC' },
    })
  }

  async getTree(): Promise<any[]> {
    const departments = await this.findAll()
    return this.buildTree(departments)
  }

  private buildTree(departments: Department[], parentId: number | null = null): any[] {
    return departments
      .filter((d) => d.parent_id === parentId)
      .map((d) => ({
        ...d,
        children: this.buildTree(departments, d.id),
      }))
  }

  async findOne(id: number): Promise<Department> {
    const department = await this.departmentRepository.findOne({ where: { id } })
    if (!department) {
      throw new NotFoundException('部门不存在')
    }
    return department
  }

  async update(id: number, updateDto: UpdateDepartmentDto): Promise<Department> {
    const department = await this.findOne(id)

    if (updateDto.parent_id !== undefined) {
      if (updateDto.parent_id === id) {
        throw new BadRequestException('不能将自己设为父部门')
      }
      if (updateDto.parent_id) {
        const parent = await this.departmentRepository.findOne({
          where: { id: updateDto.parent_id },
        })
        if (!parent) {
          throw new BadRequestException('父部门不存在')
        }
        department.level = parent.level + 1
      }
    }

    Object.assign(department, updateDto)
    return this.departmentRepository.save(department)
  }

  async remove(id: number): Promise<void> {
    const department = await this.findOne(id)

    // 检查是否有子部门
    const children = await this.departmentRepository.find({
      where: { parent_id: id },
    })
    if (children.length > 0) {
      throw new BadRequestException('该部门下有子部门，无法删除')
    }

    await this.departmentRepository.remove(department)
  }

  async getMembers(departmentId: number) {
    const dept = await this.findOne(departmentId)
    // 获取该部门及其子部门的所有成员
    const childDepts = await this.getAllChildIds(departmentId)
    const allDeptIds = [departmentId, ...childDepts]

    const users = await this.departmentRepository.manager
      .createQueryBuilder()
      .from('users', 'user')
      .where('user.department_id IN (:...deptIds)', { deptIds: allDeptIds })
      .andWhere('user.status = 1')
      .getRawMany()

    return users
  }

  private async getAllChildIds(parentId: number): Promise<number[]> {
    const children = await this.departmentRepository.find({
      where: { parent_id: parentId },
    })
    let ids = children.map((c) => c.id)
    for (const child of children) {
      const childIds = await this.getAllChildIds(child.id)
      ids = ids.concat(childIds)
    }
    return ids
  }
}
