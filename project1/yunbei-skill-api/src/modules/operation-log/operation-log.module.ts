import { Module, Global } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { OperationLogService } from './operation-log.service'
import { OperationLogController } from './operation-log.controller'
import { OperationLog } from './entities/operation-log.entity'

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([OperationLog])],
  controllers: [OperationLogController],
  providers: [OperationLogService],
  exports: [OperationLogService]
})
export class OperationLogModule {}