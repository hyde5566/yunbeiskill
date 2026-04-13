import { SkillCategoryService } from './skill-category.service';
import { CreateSkillCategoryDto, UpdateSkillCategoryDto } from './dto/skill-category.dto';
export declare class SkillCategoryController {
    private readonly categoryService;
    constructor(categoryService: SkillCategoryService);
    findAll(): Promise<import("./entities/skill-category.entity").SkillCategory[]>;
    findOne(id: number): Promise<import("./entities/skill-category.entity").SkillCategory>;
    create(createDto: CreateSkillCategoryDto): Promise<import("./entities/skill-category.entity").SkillCategory>;
    update(id: number, updateDto: UpdateSkillCategoryDto): Promise<import("./entities/skill-category.entity").SkillCategory>;
    remove(id: number): Promise<void>;
}
