import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { Reflector } from '@nestjs/core';
import { IS_SKIP_PERMISSION } from 'src/decorators/is-skip-permission.decorator';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class PermissionAuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private reflector: Reflector,
    private redisService: RedisService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isSkipPermission = this.reflector.getAllAndOverride<boolean>(IS_SKIP_PERMISSION, [
      context.getHandler(),
      context.getClass()
    ])

    const request = context.switchToHttp().getRequest();
    const targetMethod = request.method
    const targetPath = request.route.path
    // console.log(targetMethod)
    // console.log(targetPath)
    if(targetPath.startsWith('/auth')) {
      return true
    }
    // Check if role exists in redis first
    let cachedRole = await this.redisService.getValueByKey(`role:${request.user.role.id}`)
    if(!cachedRole) {
      const userPermissions = await this.authService.getUserPermissions(request.user.role)
      cachedRole = userPermissions.role
      await this.redisService.setKeyWithEx(`role:${cachedRole.id}`, JSON.stringify(cachedRole))
    }  
    const checkPermission = cachedRole.rolePermissions.some(rolePermission => (
      targetMethod === rolePermission.permission.method
      &&
      targetPath === rolePermission.permission.api_path
    ))
    if(!checkPermission && !isSkipPermission) {
      throw new ForbiddenException(`You're not allowed to access this endpoint`)
    }
    return true
  }
}