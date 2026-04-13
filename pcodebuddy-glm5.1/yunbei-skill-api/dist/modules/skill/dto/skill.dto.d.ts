export declare class CreateSkillDto {
    name: string;
    summary: string;
    detail: string;
    author: string;
    category_id: number;
    source_type: string;
    source_url?: string;
    source_url_name?: string;
    project_ids?: number[];
    visibility_type: string;
    visibility_account_ids?: number[];
    version_number: string;
    change_log: string;
}
export declare class UpdateSkillDto {
    name?: string;
    summary?: string;
    detail?: string;
    author?: string;
    category_id?: number;
    source_type?: string;
    source_url?: string;
    source_url_name?: string;
    project_ids?: number[];
    visibility_type?: string;
    visibility_account_ids?: number[];
}
export declare class SubmitVersionDto {
    version_number: string;
    change_log: string;
}
export declare class SkillQueryDto {
    keyword?: string;
    category_id?: number;
    source_type?: string;
    status?: string;
}
