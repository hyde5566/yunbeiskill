import { Skill } from './skill.entity';
import { User } from '../../user/entities/user.entity';
export declare class SkillVersion {
    id: number;
    skill_id: number;
    version_number: string;
    zip_path: string;
    zip_size: number;
    change_log: string;
    uploader_id: number;
    status: string;
    created_at: Date;
    skill: Skill;
    uploader: User;
}
