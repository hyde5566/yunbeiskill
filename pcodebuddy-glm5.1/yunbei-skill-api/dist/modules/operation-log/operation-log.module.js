"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OperationLogModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const operation_log_controller_1 = require("./operation-log.controller");
const operation_log_service_1 = require("./operation-log.service");
const operation_log_entity_1 = require("./entities/operation-log.entity");
let OperationLogModule = class OperationLogModule {
};
exports.OperationLogModule = OperationLogModule;
exports.OperationLogModule = OperationLogModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([operation_log_entity_1.OperationLog])],
        controllers: [operation_log_controller_1.OperationLogController],
        providers: [operation_log_service_1.OperationLogService],
        exports: [operation_log_service_1.OperationLogService],
    })
], OperationLogModule);
//# sourceMappingURL=operation-log.module.js.map