import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from 'src/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailModule } from 'src/mail/mail.module';
import { RedisModule } from 'src/redis/redis.module';
import { JwtAuthGuard } from './guards/jwt-guard.guard';
import { PermissionAuthGuard } from './guards/permission-guard.guard';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_ACCESS_TOKEN_SECRET'),
        signOptions:{
          expiresIn: configService.get<string>('JWT_ACCESS_TOKEN_EXPIRATION')
        } 
      }),
      inject: [ConfigService]
    }),
    forwardRef(() => UsersModule),
    ConfigModule,
    JwtModule,
    MailModule,
    RedisModule
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtAuthGuard, PermissionAuthGuard],
  exports: [AuthService]
})
export class AuthModule {}
