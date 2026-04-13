import { Skill } from './skill.entity';
export declare class SkillVisibility {
    id: number;
    skill_id: number;
    target_type: string;
    target_id: number;
    created_at: Date;
    skill: Skill;
}
