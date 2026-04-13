export declare class CreateProjectDto {
    name: string;
    description?: string;
    owner_id: number;
}
export declare class UpdateProjectDto {
    name?: string;
    description?: string;
    owner_id?: number;
    status?: string;
}
export declare class AddProjectMembersDto {
    user_ids: number[];
}
export declare class AddProjectSkillDto {
    skill_ids: number[];
}
