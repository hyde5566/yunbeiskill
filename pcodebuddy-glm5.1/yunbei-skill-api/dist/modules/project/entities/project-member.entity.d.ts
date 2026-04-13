import { Project } from './project.entity';
import { User } from '../../user/entities/user.entity';
export declare class ProjectMember {
    id: number;
    project_id: number;
    user_id: number;
    role: string;
    joined_at: Date;
    project: Project;
    user: User;
}
