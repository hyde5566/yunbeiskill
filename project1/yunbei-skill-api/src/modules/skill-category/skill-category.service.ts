import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { SkillCategory } from './entities/skill-category.entity'
import { CreateCategoryDto } from './dto/create-category.dto'
import { UpdateCategoryDto } from './dto/update-category.dto'
import { Skill } from '../skill/entities/skill.entity'

@Injectable()
export class SkillCategoryService {
  constructor(
    @InjectRepository(SkillCategory)
    private categoryRepo: Repository<SkillCategory>,
    @InjectRepository(Skill)
    private skillRepo: Repository<Skill>
  ) {}

  async create(dto: CreateCategoryDto): Promise<SkillCategory> {
    const category = this.categoryRepo.create({
      name: dto.name,
      description: dto.description,
      sortOrder: dto.sortOrder || 0
    })
    return this.categoryRepo.save(category)
  }

  async update(id: number, dto: UpdateCategoryDto): Promise<SkillCategory> {
    const category = await this.findById(id)
    if (dto.name) category.name = dto.name
    if (dto.description !== undefined) category.description = dto.description
    if (dto.sortOrder !== undefined) category.sortOrder = dto.sortOrder
    return this.categoryRepo.save(category)
  }

  async findById(id: number): Promise<SkillCategory> {
    const category = await this.categoryRepo.findOne({ where: { id } })
    if (!category) throw new NotFoundException('分类不存在')
    return category
  }

  async remove(id: number): Promise<void> {
    // 检查是否有Skill关联
    const skillCount = await this.skillRepo.count({ where: { categoryId: id } })
    if (skillCount > 0) {
      throw new BadRequestException('存在关联的Skill，无法删除')
    }
    const category = await this.findById(id)
    await this.categoryRepo.remove(category)
  }

  async list(): Promise<SkillCategory[]> {
    return this.categoryRepo.find({
      order: { sortOrder: 'ASC', id: 'ASC' }
    })
  }
}