import { User } from '../../user/entities/user.entity';
import { Skill } from '../../skill/entities/skill.entity';
import { SkillVersion } from '../../skill/entities/skill-version.entity';
export declare class Rating {
    id: number;
    user_id: number;
    skill_id: number;
    version_id: number;
    score: number;
    created_at: Date;
    user: User;
    skill: Skill;
    version: SkillVersion;
}
