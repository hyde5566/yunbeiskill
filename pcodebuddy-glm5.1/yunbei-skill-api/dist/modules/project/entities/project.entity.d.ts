import { User } from '../../user/entities/user.entity';
import { ProjectMember } from './project-member.entity';
import { ProjectSkill } from './project-skill.entity';
export declare class Project {
    id: number;
    name: string;
    description: string;
    owner_id: number;
    status: string;
    created_at: Date;
    updated_at: Date;
    owner: User;
    members: ProjectMember[];
    projectSkills: ProjectSkill[];
}
