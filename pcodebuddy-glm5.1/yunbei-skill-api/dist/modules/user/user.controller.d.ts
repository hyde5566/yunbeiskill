import { UserService } from './user.service';
import { CreateUserDto, UpdateUserDto } from './dto/create-user.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
    findAll(pagination: PaginationDto, keyword?: string): Promise<import("../../common/dto/pagination.dto").PaginatedResult<import("./entities/user.entity").User>>;
    getProfile(user: any): Promise<{
        permissions: string[];
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
        department: import("../department/entities/department.entity").Department;
    }>;
    findOne(id: number): Promise<{
        permissions: string[];
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
        department: import("../department/entities/department.entity").Department;
    }>;
    create(createUserDto: CreateUserDto): Promise<import("./entities/user.entity").User>;
    update(id: number, updateUserDto: UpdateUserDto): Promise<import("./entities/user.entity").User>;
    remove(id: number): Promise<void>;
}
