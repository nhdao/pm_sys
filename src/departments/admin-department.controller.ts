import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { DepartmentsService } from './departments.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserDepartmentDto } from 'src/users/dto/user-department.dto';
import { SkipPermission } from 'src/decorators/is-skip-permission.decorator';
import { DepartmentPaginationDto } from './dto/department-pagination.dto';

@ApiTags('Admin/Departments')
@Controller('admin/departments')
export class AdminDepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @ApiOperation({ summary: 'Admin: Create new department' })
  @Post()
  create(@Body() createDepartmentDto: CreateDepartmentDto) {
    return this.departmentsService.adminCreateDepartment(createDepartmentDto);
  }

  @ApiOperation({ summary: 'Admin: Assign users to department' })
  @Patch(':id/assign-users')
  adminAssignDepartmentForUsers(@Param('id') id: string, @Body() userDepartment: UserDepartmentDto) {
    return this.departmentsService.adminAssignDepartmentForUsers(+id, userDepartment);
  }

  @ApiOperation({ summary: 'Admin: Get list departments' })
  @Get()
  findAll(@Query() departmentPaginationDto: DepartmentPaginationDto) {
    return this.departmentsService.adminFindAllDepartments(departmentPaginationDto);
  }
 
  @ApiOperation({ summary: 'Admin: Update department info' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDepartmentDto: UpdateDepartmentDto) {
    return this.departmentsService.adminUpdateDepartmentById(+id, updateDepartmentDto);
  }

  @ApiOperation({ summary: 'Admin: Delete department' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.departmentsService.adminRemoveDepartmentById(+id);
  }

  @ApiOperation({ summary: 'Admin: Get department info' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.departmentsService.getDepartmentInfo(+id);
  }

  @SkipPermission()
  @ApiOperation({ summary: 'Admin: Get users of department' })
  @Get(':id/users')
  getUsersByDepartment(@Param('id') id: string) {
    return this.departmentsService.getUsersByDepartment(+id)
  }

  @SkipPermission()
  @ApiOperation({ summary: 'Admin: Get projects of department' })
  @Get(':id/projects')
  getProjectsByDepartment(@Param('id') id: string) {
    return this.departmentsService.getProjectsByDepartment(+id)
  }
}
