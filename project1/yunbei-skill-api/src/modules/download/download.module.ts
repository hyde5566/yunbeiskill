import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { DownloadService } from './download.service'
import { DownloadController } from './download.controller'
import { DownloadRecord } from './entities/download-record.entity'
import { SkillVersion } from '../skill/entities/skill-version.entity'

@Module({
  imports: [TypeOrmModule.forFeature([DownloadRecord, SkillVersion])],
  controllers: [DownloadController],
  providers: [DownloadService],
  exports: [DownloadService]
})
export class DownloadModule {}