import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UserDto } from 'src/users/dto/user.dto';
import { Response } from 'express';
import { Public } from 'src/decorators/is-public.decorator';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
@Public()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Register new user' })
  @Post('register')
  register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto)
  }

  @ApiOperation({ summary: 'Log in' })
  @Post('signin')
  signin(@Body() userDto: UserDto, @Res({ passthrough: true }) res: Response) {
    return this.authService.signIn(userDto.email, userDto.password, res)
  }

  @ApiOperation({ summary: 'Handle refresh token' })
  @Get('/refresh')
  handleRefreshToken(@Req() req: any, @Res({ passthrough: true }) res: Response) {
    return this.authService.handleRefreshToken(req.cookies['refresh_token'], res)
  }
}
