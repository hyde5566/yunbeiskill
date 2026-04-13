import { SkillCategory } from '../../skill-category/entities/skill-category.entity';
import { User } from '../../user/entities/user.entity';
import { SkillVersion } from './skill-version.entity';
import { SkillVisibility } from './skill-visibility.entity';
export declare class Skill {
    id: number;
    unique_id: string;
    name: string;
    summary: string;
    detail: string;
    author: string;
    category_id: number;
    source_type: string;
    source_url: string;
    source_url_name: string;
    submitter_id: number;
    status: string;
    visibility_type: string;
    created_at: Date;
    updated_at: Date;
    category: SkillCategory;
    submitter: User;
    versions: SkillVersion[];
    visibilityList: SkillVisibility[];
}
