import { User } from '../../user/entities/user.entity';
import { Permission } from './permission.entity';
export declare class UserPermission {
    id: number;
    user_id: number;
    permission_id: number;
    assigned_by: number;
    assigned_at: Date;
    user: User;
    permission: Permission;
}
