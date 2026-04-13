import { User } from '../../user/entities/user.entity';
export declare class OperationLog {
    id: number;
    user_id: number;
    module: string;
    action: string;
    target_type: string;
    target_id: number;
    detail: string;
    ip_address: string;
    created_at: Date;
    user: User;
}
