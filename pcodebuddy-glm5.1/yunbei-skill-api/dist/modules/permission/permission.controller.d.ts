import { PermissionService } from './permission.service';
import { AssignPermissionsDto } from './dto/permission.dto';
export declare class PermissionController {
    private readonly permissionService;
    constructor(permissionService: PermissionService);
    findAll(): Promise<import("./entities/permission.entity").Permission[]>;
    getUserPermissions(userId: number): Promise<import("./entities/permission.entity").Permission[]>;
    assignPermissions(assignDto: AssignPermissionsDto, user: any): Promise<void>;
}
