import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { SchedulerController } from './scheduler.controller';
import { SchedulerService } from './scheduler.service';
import { PrismaModule } from '../common/prisma/prisma.module';
import { DataSourceModule } from '../datasource/datasource.module';
import { NotifyModule } from '../notify/notify.module';

@Module({
  imports: [ScheduleModule.forRoot(), PrismaModule, DataSourceModule, NotifyModule],
  controllers: [SchedulerController],
  providers: [SchedulerService],
})
export class SchedulerModule {}
