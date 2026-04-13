import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { SkillCategory } from './entities/skill-category.entity'
import { CreateSkillCategoryDto, UpdateSkillCategoryDto } from './dto/skill-category.dto'

@Injectable()
export class SkillCategoryService {
  constructor(
    @InjectRepository(SkillCategory)
    private categoryRepository: Repository<SkillCategory>,
  ) {}

  async create(createDto: CreateSkillCategoryDto): Promise<SkillCategory> {
    const category = this.categoryRepository.create(createDto)
    return this.categoryRepository.save(category)
  }

  async findAll(): Promise<SkillCategory[]> {
    return this.categoryRepository.find({
      order: { sort_order: 'ASC', id: 'ASC' },
    })
  }

  async findOne(id: number): Promise<SkillCategory> {
    const category = await this.categoryRepository.findOne({ where: { id } })
    if (!category) {
      throw new NotFoundException('分类不存在')
    }
    return category
  }

  async update(id: number, updateDto: UpdateSkillCategoryDto): Promise<SkillCategory> {
    const category = await this.findOne(id)
    Object.assign(category, updateDto)
    return this.categoryRepository.save(category)
  }

  async remove(id: number): Promise<void> {
    const category = await this.findOne(id)
    await this.categoryRepository.remove(category)
  }
}
