import { UserPermission } from './user-permission.entity';
export declare class Permission {
    id: number;
    code: string;
    name: string;
    description: string;
    created_at: Date;
    userPermissions: UserPermission[];
}
