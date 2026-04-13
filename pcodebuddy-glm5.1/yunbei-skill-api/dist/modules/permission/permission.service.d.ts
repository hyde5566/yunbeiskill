import { Repository } from 'typeorm';
import { Permission } from './entities/permission.entity';
import { UserPermission } from './entities/user-permission.entity';
import { AssignPermissionsDto } from './dto/permission.dto';
export declare class PermissionService {
    private permissionRepository;
    private userPermissionRepository;
    constructor(permissionRepository: Repository<Permission>, userPermissionRepository: Repository<UserPermission>);
    findAll(): Promise<Permission[]>;
    getUserPermissions(userId: number): Promise<Permission[]>;
    assignPermissions(assignDto: AssignPermissionsDto, assignedBy: number): Promise<void>;
}
