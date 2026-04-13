"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequirePermission = exports.Public = exports.PERMISSIONS_KEY = exports.IS_PUBLIC_KEY = void 0;
const common_1 = require("@nestjs/common");
exports.IS_PUBLIC_KEY = 'isPublic';
exports.PERMISSIONS_KEY = 'permissions';
const Public = () => (0, common_1.SetMetadata)(exports.IS_PUBLIC_KEY, true);
exports.Public = Public;
const RequirePermission = (...permissions) => (0, common_1.SetMetadata)(exports.PERMISSIONS_KEY, permissions);
exports.RequirePermission = RequirePermission;
//# sourceMappingURL=public.decorator.js.map