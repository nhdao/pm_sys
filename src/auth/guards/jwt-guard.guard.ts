import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from 'src/decorators/is-public.decorator';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private reflector: Reflector
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass()
    ])

    if(isPublic) {
      return true
    }

    const request = context.switchToHttp().getRequest();
    const { authorization } = request.headers;
    if (!authorization || !authorization.startsWith('Bearer')) {
        throw new UnauthorizedException('Please provide token');
    }
    
    const accessToken = authorization.split(' ')[1]

    const decodedData = await this.authService.validateToken(accessToken);

    if(!decodedData) {
      throw new UnauthorizedException('Invalid token')
    }

    const foundUser = await this.authService.getUserDetail(decodedData.id)
    if(!foundUser) {
      throw new UnauthorizedException('Invalid user') 
    }

    request.user = {
      id: decodedData.id,
      email: decodedData.email,
      role: foundUser.role,
      department: foundUser.department,
    }
    // console.log(request.user)
    return true
  }
}