export declare const IS_PUBLIC_KEY = "isPublic";
export declare const PERMISSIONS_KEY = "permissions";
export declare const Public: () => import("@nestjs/common").CustomDecorator<string>;
export declare const RequirePermission: (...permissions: string[]) => import("@nestjs/common").CustomDecorator<string>;
