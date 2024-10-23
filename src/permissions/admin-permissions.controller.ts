import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PermissisonPaginationDto } from './dto/permission-pagination-query.dto';

@ApiTags('Admin/Permissions')
@Controller('admin/permissions')
export class AdminPermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @ApiOperation({ summary: 'Admin: Create new permission' })
  @Post()
  create(@Body() createPermissionDto: CreatePermissionDto) {
    return this.permissionsService.adminCreatePermisison(createPermissionDto);
  }

  @ApiOperation({ summary: 'Admin: Get list permissions' })
  @Get()
  findAll(@Query() permissionPaginationDto: PermissisonPaginationDto) {
    return this.permissionsService.adminFindAllPermissions(permissionPaginationDto);
  }

  @ApiOperation({ summary: 'Admin: Get permission info' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.permissionsService.adminGetPermissionInfo(+id);
  }

  @ApiOperation({ summary: 'Admin: Update permission info' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePermissionDto: UpdatePermissionDto) {
    return this.permissionsService.adminUpdatePermissionById(+id, updatePermissionDto);
  }

  @ApiOperation({ summary: 'Admin: Delete permission' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.permissionsService.adminRemovePermissionById(+id);
  }
}
