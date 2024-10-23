/* eslint-disable @typescript-eslint/no-unused-vars */
import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PaginationQueryDto } from 'src/common/pagination-query.dto';
import { UserRoleDto } from 'src/users/dto/user-role.dto';
import { SkipPermission } from 'src/decorators/is-skip-permission.decorator';

@ApiTags('Admin/Roles')
@Controller('admin/roles')
export class AdminRolesController {
  constructor(private readonly rolesService: RolesService) {}

  @ApiOperation({ summary: 'Admin: Create new role' })
  @Post()
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.rolesService.adminCreateRole(createRoleDto);
  }

  @ApiOperation({ summary: 'Admin: Get list roles' })
  @Get()
  findAll(@Query() paginationQueryDto: PaginationQueryDto) {
    return this.rolesService.adminFindAllRoles(paginationQueryDto);
  }

  @ApiOperation({ summary: 'Admin: Assign role to users' })
  @Patch(':id/assign-users')
  assignRole(@Param('id') id: string, @Body() userRole: UserRoleDto) {
    return this.rolesService.adminAssignRoleToUsers(+id, userRole);
  }

  @ApiOperation({ summary: 'Admin: Get role info' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.rolesService.adminGetRoleInfo(+id);
  }

  @ApiOperation({ summary: 'Admin: Update role info' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.rolesService.adminUpdateRoleById(+id, updateRoleDto);
  }

  @ApiOperation({ summary: 'Admin: Delete task' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.rolesService.adminRemoveRoleById(+id);
  }
}
