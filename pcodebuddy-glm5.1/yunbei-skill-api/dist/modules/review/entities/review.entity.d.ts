import { Skill } from '../../skill/entities/skill.entity';
import { SkillVersion } from '../../skill/entities/skill-version.entity';
import { User } from '../../user/entities/user.entity';
export declare class Review {
    id: number;
    skill_id: number;
    version_id: number;
    reviewer_id: number | null;
    assigned_by: number;
    status: string;
    comment: string;
    reviewed_at: Date;
    created_at: Date;
    skill: Skill;
    version: SkillVersion;
    reviewer: User;
    assigner: User;
}
