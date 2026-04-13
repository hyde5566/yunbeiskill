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
exports.NotificationService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const notification_entity_1 = require("./entities/notification.entity");
const pagination_dto_1 = require("../../common/dto/pagination.dto");
let NotificationService = class NotificationService {
    notificationRepository;
    constructor(notificationRepository) {
        this.notificationRepository = notificationRepository;
    }
    async create(userId, type, title, content, relatedSkillId, relatedVersionId) {
        const notification = this.notificationRepository.create({
            user_id: userId,
            type,
            title,
            content,
            related_skill_id: relatedSkillId,
            related_version_id: relatedVersionId,
        });
        return this.notificationRepository.save(notification);
    }
    async batchCreate(userIds, type, title, content, relatedSkillId, relatedVersionId) {
        const notifications = userIds.map((userId) => this.notificationRepository.create({
            user_id: userId,
            type,
            title,
            content,
            related_skill_id: relatedSkillId,
            related_version_id: relatedVersionId,
        }));
        return this.notificationRepository.save(notifications);
    }
    async getMyNotifications(userId, pagination) {
        const [list, total] = await this.notificationRepository.findAndCount({
            where: { user_id: userId },
            order: { created_at: 'DESC' },
            skip: pagination.skip,
            take: pagination.take,
        });
        return new pagination_dto_1.PaginatedResult(list, total, pagination.page, pagination.pageSize);
    }
    async getUnreadCount(userId) {
        return this.notificationRepository.count({
            where: { user_id: userId, is_read: 0 },
        });
    }
    async markAsRead(id, userId) {
        await this.notificationRepository.update({ id, user_id: userId }, { is_read: 1 });
    }
    async markAllAsRead(userId) {
        await this.notificationRepository.update({ user_id: userId, is_read: 0 }, { is_read: 1 });
    }
    async remove(id, userId) {
        await this.notificationRepository.delete({ id, user_id: userId });
    }
};
exports.NotificationService = NotificationService;
exports.NotificationService = NotificationService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(notification_entity_1.Notification)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], NotificationService);
//# sourceMappingURL=notification.service.js.map