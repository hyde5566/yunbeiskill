import { User } from '../../user/entities/user.entity';
import { Skill } from '../../skill/entities/skill.entity';
import { SkillVersion } from '../../skill/entities/skill-version.entity';
export declare class Notification {
    id: number;
    user_id: number;
    type: string;
    title: string;
    content: string;
    related_skill_id: number;
    related_version_id: number;
    is_read: number;
    created_at: Date;
    user: User;
    skill: Skill;
    version: SkillVersion;
}
