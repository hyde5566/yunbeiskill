import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { UserPermission } from '../permission/entities/user-permission.entity';
import { Permission } from '../permission/entities/permission.entity';
import { LoginDto } from './dto/login.dto';
export declare class AuthService {
    private userRepository;
    private userPermissionRepository;
    private permissionRepository;
    private jwtService;
    constructor(userRepository: Repository<User>, userPermissionRepository: Repository<UserPermission>, permissionRepository: Repository<Permission>, jwtService: JwtService);
    login(loginDto: LoginDto): Promise<{
        access_token: string;
        user: {
            id: number;
            username: string;
            real_name: string;
            department_id: number;
            permissions: string[];
        };
    }>;
    getUserPermissions(userId: number): Promise<string[]>;
    getProfile(userId: number): Promise<{
        id: number;
        username: string;
        real_name: string;
        department_id: number;
        email: string;
        phone: string;
        status: number;
        permissions: string[];
        isAdmin: boolean;
    }>;
}
