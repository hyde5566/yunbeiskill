export declare class Department {
    id: number;
    name: string;
    parent_id: number;
    level: number;
    sort_order: number;
    created_at: Date;
    updated_at: Date;
    parent: Department;
    children: Department[];
}
