import { Project } from './project.entity';
import { Skill } from '../../skill/entities/skill.entity';
export declare class ProjectSkill {
    id: number;
    project_id: number;
    skill_id: number;
    created_at: Date;
    project: Project;
    skill: Skill;
}
