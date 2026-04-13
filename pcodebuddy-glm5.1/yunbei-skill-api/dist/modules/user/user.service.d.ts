import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UserPermission } from '../permission/entities/user-permission.entity';
import { Permission } from '../permission/entities/permission.entity';
import { CreateUserDto, UpdateUserDto } from './dto/create-user.dto';
import { PaginatedResult, PaginationDto } from '../../common/dto/pagination.dto';
export declare class UserService {
    private userRepository;
    private userPermissionRepository;
    private permissionRepository;
    constructor(userRepository: Repository<User>, userPermissionRepository: Repository<UserPermission>, permissionRepository: Repository<Permission>);
    create(createUserDto: CreateUserDto): Promise<User>;
    findAll(pagination: PaginationDto, keyword?: string): Promise<PaginatedResult<User>>;
    findOne(id: number): Promise<User>;
    update(id: number, updateUserDto: UpdateUserDto): Promise<User>;
    remove(id: number): Promise<void>;
    getUserPermissions(userId: number): Promise<string[]>;
    getUserWithPermissions(id: number): Promise<{
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
}
