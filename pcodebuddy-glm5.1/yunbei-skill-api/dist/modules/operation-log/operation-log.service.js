"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OperationLogService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const operation_log_entity_1 = require("./entities/operation-log.entity");
const pagination_dto_1 = require("../../common/dto/pagination.dto");
let OperationLogService = class OperationLogService {
    operationLogRepository;
    constructor(operationLogRepository) {
        this.operationLogRepository = operationLogRepository;
    }
    async create(userId, module, action, detail, targetType, targetId, ipAddress) {
        const log = this.operationLogRepository.create({
            user_id: userId,
            module,
            action,
            detail,
            target_type: targetType,
            target_id: targetId,
            ip_address: ipAddress,
        });
        return this.operationLogRepository.save(log);
    }
    async findAll(pagination, module, startDate, endDate) {
        const query = this.operationLogRepository
            .createQueryBuilder('log')
            .leftJoinAndSelect('log.user', 'user');
        if (module) {
            query.where('log.module = :module', { module });
        }
        if (startDate && endDate) {
            query.andWhere('log.created_at BETWEEN :startDate AND :endDate', { startDate, endDate });
        }
        const [list, total] = await query
            .skip(pagination.skip)
            .take(pagination.take)
            .orderBy('log.created_at', 'DESC')
            .getManyAndCount();
        return new pagination_dto_1.PaginatedResult(list, total, pagination.page, pagination.pageSize);
    }
};
exports.OperationLogService = OperationLogService;
exports.OperationLogService = OperationLogService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(operation_log_entity_1.OperationLog)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], OperationLogService);
//# sourceMappingURL=operation-log.service.js.map