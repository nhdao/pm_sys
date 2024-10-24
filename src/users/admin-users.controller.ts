import { Controller, Get, Body, Patch, Param, Delete, Query, UseInterceptors, ClassSerializerInterceptor } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserApprovalDto } from './dto/user-approval.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserStatisticDto } from './dto/user-statistic.dto';
import { UserPaginationDto } from './dto/user-pagination.dto';

@ApiTags('Admin/Users')
@Controller('admin/users')
export class AdminUsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'Get list users' })
  @UseInterceptors(ClassSerializerInterceptor)
  @Get()
  findAll(@Query() userPaginationDto: UserPaginationDto) {
    return this.usersService.adminFindAllUsers(userPaginationDto);
  }

  @ApiOperation({ summary: 'Get user statistic based on tech and project' })
  @Get('user-statistic') 
  countUser(@Query() userStatistic: UserStatisticDto) {
    return this.usersService.adminCountUser(userStatistic)
  }

  @ApiOperation({ summary: 'Approve user' })
  @Patch('change-approval')
  changeApproval(@Body() userApproval: UserApprovalDto) {
    return this.usersService.adminChangeApproval(userApproval);
  }

  @ApiOperation({ summary: 'Get user information' })
  @Get(':id') 
  async findOne(@Param('id') id: string) {
    return this.usersService.adminGetUserInfo(+id)
  }

  @ApiOperation({ summary: 'Delete user' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.adminRemoveUserById(+id);
  }
}
