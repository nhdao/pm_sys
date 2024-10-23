import { Module } from '@nestjs/common';
import { RolesService } from './roles.service';
import { AdminRolesController } from './admin-roles.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolePermission } from './entities/role-permission.entity';
import { Role } from './entities/role.entity';
import { PermissionsModule } from 'src/permissions/permissions.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Role, RolePermission
    ]),
    PermissionsModule,
    UsersModule
  ],
  controllers: [AdminRolesController],
  providers: [RolesService],
  exports: [RolesService]
})
export class RolesModule {}
