import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { Reflector } from '@nestjs/core';
import { IS_SKIP_PERMISSION } from 'src/decorators/is-skip-permission.decorator';

@Injectable()
export class PermissionAuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private reflector: Reflector
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

    const userPermissions = await this.authService.getUserPermissions(request.user.role)
    const checkPermission = userPermissions.role.rolePermissions.some(rolePermissions => (
      targetMethod === rolePermissions.permission.method
      &&
      targetPath === rolePermissions.permission.api_path
    ))

    // console.log(checkPermission)
    
    if(!checkPermission && !isSkipPermission) {
      throw new ForbiddenException(`You're not allowed to access this endpoint`)
    }
    return true
  }
}