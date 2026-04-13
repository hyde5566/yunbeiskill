import { Repository } from 'typeorm';
import { SkillCategory } from './entities/skill-category.entity';
import { CreateSkillCategoryDto, UpdateSkillCategoryDto } from './dto/skill-category.dto';
export declare class SkillCategoryService {
    private categoryRepository;
    constructor(categoryRepository: Repository<SkillCategory>);
    create(createDto: CreateSkillCategoryDto): Promise<SkillCategory>;
    findAll(): Promise<SkillCategory[]>;
    findOne(id: number): Promise<SkillCategory>;
    update(id: number, updateDto: UpdateSkillCategoryDto): Promise<SkillCategory>;
    remove(id: number): Promise<void>;
}
