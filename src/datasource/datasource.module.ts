import { Module } from '@nestjs/common';
import { DataSourceController } from './datasource.controller';
import { DataSourceService } from './datasource.service';
import { PrismaModule } from '../common/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [DataSourceController],
  providers: [DataSourceService],
  exports: [DataSourceService],
})
export class DataSourceModule {}
