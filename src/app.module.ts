import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './common/prisma/prisma.module';
import { RbacModule } from './rbac/rbac.module';
import { UsersModule } from './users/users.module';
import { DataSourceModule } from './datasource/datasource.module';
import { NotifyModule } from './notify/notify.module';
import { SchedulerModule } from './scheduler/scheduler.module';
import { JwtAuthGuard } from './common/auth/jwt-auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET ?? 'dev-jwt-secret',
      signOptions: { expiresIn: '7d' },
    }),
    PrismaModule,
    AuthModule,
    RbacModule,
    UsersModule,
    DataSourceModule,
    NotifyModule,
    SchedulerModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
