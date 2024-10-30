import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from 'src/decorators/is-public.decorator';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private reflector: Reflector,
    private redisService: RedisService
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
    // Check token in blacklist
    if(await this.redisService.checkKeyExist(accessToken)) {
      throw new UnauthorizedException('Invalid token')
    }
    const decodedData = await this.authService.validateToken(accessToken);
    if(!decodedData) {
      throw new UnauthorizedException('Invalid token')
    }
    // Check user info in cache first
    let cachedUser = await this.redisService.getValueByKey(`user:${decodedData.id}`)
    if(!cachedUser) {
      const foundUser = await this.authService.getUserDetail(decodedData.id)
      if(!foundUser) {
        throw new UnauthorizedException('Invalid user') 
      }
      cachedUser = foundUser
      await this.redisService.setKeyWithEx(`user:${foundUser.id}`, JSON.stringify(cachedUser))
    } 
    request.user = {
      id: cachedUser.id,
      email: cachedUser.email,
      role: cachedUser.role,
      department: cachedUser.department,
    }
    return true
  }
}