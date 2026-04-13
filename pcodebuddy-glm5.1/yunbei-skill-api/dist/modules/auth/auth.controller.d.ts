import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
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
    getProfile(user: any): Promise<{
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
