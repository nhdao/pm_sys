import { Body, Controller, Get, Patch } from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SkipPermission } from 'src/decorators/is-skip-permission.decorator';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { IUser } from 'src/interfaces/current-user.interface';
import { UpdateUserDto } from './dto/update-user.dto';

@ApiTags('User')
@Controller('user')
@SkipPermission()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'Get user profile' })
  @Get('profile') 
  async findOne(@CurrentUser() currentUser: IUser) {
    return this.usersService.getProfile(+currentUser.id)
  }

  @ApiOperation({ summary: 'Get user profile' })
  @Patch('profile') 
  async update(@Body() updateUserDto: UpdateUserDto, @CurrentUser() currentUser: IUser) {
    return this.usersService.updateProfile(updateUserDto, currentUser)
  }
}
