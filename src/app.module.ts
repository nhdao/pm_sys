/* eslint-disable @typescript-eslint/no-unused-vars */
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { ProjectsModule } from './projects/projects.module';
import { TechnologiesModule } from './technologies/technologies.module';
import { DepartmentsModule } from './departments/departments.module';
import { TasksModule } from './tasks/tasks.module';
import { ClientsModule } from './clients/clients.module';
import { RolesModule } from './roles/roles.module';
import { PermissionsModule } from './permissions/permissions.module';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/guards/jwt-guard.guard';
import { CronsModule } from './crons/crons.module';
import { ScheduleModule } from '@nestjs/schedule';
import { PermissionAuthGuard } from './auth/guards/permission-guard.guard';
import { MailModule } from './mail/mail.module';
import { RedisModule } from './redis/redis.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, //We do not need to reimport ConfigModule in others file
      envFilePath: `.env`
    }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService], //Add ConfigService to DI system
      useFactory: (config: ConfigService) => {
        return {
          type: 'postgres',
          host: config.get<string>('DB_HOST'),
          port: parseInt(config.get<string>('DB_PORT')),
          password: config.get<string>('DB_PASSWORD'),
          username: config.get<string>('DB_USERNAME'),
          database: config.get<string>('DB_NAME'),
          autoLoadEntities: true,
          entities: [
            __dirname + '/**/entities/*.entity{.ts,.js}',
          ], 
          synchronize: true   //Avoid setting synchronize: true in production, which can lead to lost of data 
        }
      }
    }),
    UsersModule,
    ProjectsModule,
    TechnologiesModule,
    DepartmentsModule,
    TasksModule,
    ClientsModule,
    RolesModule,
    PermissionsModule,
    AuthModule,
    CronsModule,
    MailModule,
    RedisModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard
    },
    {
      provide: APP_GUARD,
      useClass: PermissionAuthGuard
    },
    AppService
  ],
})
export class AppModule {}
