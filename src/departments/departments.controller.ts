import { Controller, Get, Param } from '@nestjs/common';
import { DepartmentsService } from './departments.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { IUser } from 'src/interfaces/current-user.interface';
import { User } from 'src/users/entities/user.entity';

@ApiTags('Departments')
@Controller('departments')
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @ApiOperation({ summary: 'Get department of user' })
  @Get()
  findDepartmentsByUser(@CurrentUser() currentUser: User) {
    return this.departmentsService.findDepartmentByUser(currentUser);
  }

  @ApiOperation({ summary: 'Get department info' }) 
  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() currentUser: IUser) {
    return this.departmentsService.getDepartmentInfo(+id, currentUser);
  }

  @ApiOperation({ summary: 'Get users of department' })
  @Get(':id/users')
  getUsersByDepartment(@Param('id') id: string, @CurrentUser() currentUser: IUser) {
    return this.departmentsService.getUsersByDepartment(+id, currentUser)
  }

  @ApiOperation({ summary: 'Get projects of department' })
  @Get(':id/projects')
  getProjectsByDepartment(@Param('id') id: string, @CurrentUser() currentUser: IUser) {
    return this.departmentsService.getProjectsByDepartment(+id, currentUser)
  }
}
