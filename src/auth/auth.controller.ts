import { Body, Controller, Get, Param, Patch, Post, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UserDto } from 'src/users/dto/user.dto';
import { Request, Response } from 'express';
import { Public } from 'src/decorators/is-public.decorator';
import { ApiBody, ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ChangePasswordDto } from 'src/users/dto/change-password.dto';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { IUser } from 'src/interfaces/current-user.interface';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @ApiOperation({ summary: 'Register new user' })
  @Post('register')
  register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto)
  }

  @Public()
  @ApiOperation({ summary: 'Log in' })
  @Post('signin')
  signin(@Body() userDto: UserDto, @Res({ passthrough: true }) res: Response) {
    return this.authService.signIn(userDto.email, userDto.password, res)
  }

  @ApiOperation({ summary: 'Sign out' })
  @ApiHeader({
    name: 'x-refresh-token',
    description: 'Custom header for log out',
    required: true,
  })
  @Post('/signout')
  signOut(@Req() req: Request,  @CurrentUser() currentUser: IUser) {
    return this.authService.signOut(req, currentUser)
  }

  @Public()
  @ApiOperation({ summary: 'Handle refresh token' })
  @Get('refresh')
  handleRefreshToken(@Req() req: any, @Res({ passthrough: true }) res: Response) {
    return this.authService.handleRefreshToken(req.cookies['refresh_token'], res)
  }

  @Public()
  @ApiOperation({ summary: 'Forget password'})
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string' },
      },
    },
  })
  @Post('forget-password')
  resetPassword(@Body('email') email: string, @Req() req: Request) {
    return this.authService.resetPassword(email, req)
  }

  @Public()
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        password: { type: 'string' },
      },
    },
  })
  @Patch('forget-password/:code')
  forgetPassword(@Param('code') code: string, @Body('password') newPassword: string) {
    return this.authService.forgetPassword(code, newPassword)
  } 

  @ApiOperation({ summary: 'Change password' })
  @Patch('change-password')
  async changePassword(@Body() changePasswordDto: ChangePasswordDto, @CurrentUser() currentUser: IUser) {
    return this.authService.changePassword(changePasswordDto, currentUser)
  }
  
}
