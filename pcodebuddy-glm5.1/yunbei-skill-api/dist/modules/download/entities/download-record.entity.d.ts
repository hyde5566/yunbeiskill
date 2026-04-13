import { User } from '../../user/entities/user.entity';
import { Skill } from '../../skill/entities/skill.entity';
import { SkillVersion } from '../../skill/entities/skill-version.entity';
import { Department } from '../../department/entities/department.entity';
export declare class DownloadRecord {
    id: number;
    user_id: number;
    skill_id: number;
    version_id: number;
    department_id: number;
    downloaded_at: Date;
    user: User;
    skill: Skill;
    version: SkillVersion;
    department: Department;
}
