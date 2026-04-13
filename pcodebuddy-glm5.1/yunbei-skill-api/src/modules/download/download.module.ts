import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { DownloadController } from './download.controller'
import { DownloadService } from './download.service'
import { DownloadRecord } from './entities/download-record.entity'

@Module({
  imports: [TypeOrmModule.forFeature([DownloadRecord])],
  controllers: [DownloadController],
  providers: [DownloadService],
  exports: [DownloadService],
})
export class DownloadModule {}
