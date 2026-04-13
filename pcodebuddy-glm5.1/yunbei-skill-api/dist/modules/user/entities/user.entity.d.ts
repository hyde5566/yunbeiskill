import { Department } from '../../department/entities/department.entity';
export declare class User {
    id: number;
    username: string;
    password: string;
    real_name: string;
    department_id: number;
    email: string;
    phone: string;
    status: number;
    created_at: Date;
    updated_at: Date;
    department: Department;
    permissions?: string[];
}
