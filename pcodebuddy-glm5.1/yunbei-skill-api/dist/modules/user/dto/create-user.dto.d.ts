export declare class CreateUserDto {
    username: string;
    password: string;
    real_name: string;
    department_id?: number;
    email?: string;
    phone?: string;
}
export declare class UpdateUserDto {
    real_name?: string;
    department_id?: number;
    email?: string;
    phone?: string;
    status?: number;
}
