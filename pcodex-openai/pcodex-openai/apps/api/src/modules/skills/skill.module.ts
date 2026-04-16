import { Module } from "@nestjs/common";
import { NotificationModule } from "../notifications/notification.module";
import { SkillController } from "./skill.controller";
import { SkillService } from "./skill.service";
import { SkillStorageService } from "./storage/skill-storage.service";

@Module({
  imports: [NotificationModule],
  controllers: [SkillController],
  providers: [SkillService, SkillStorageService],
  exports: [SkillService, SkillStorageService],
})
export class SkillModule {}
