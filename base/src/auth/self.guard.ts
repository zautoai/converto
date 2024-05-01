import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SYSTEM_CONST } from 'src/common/constants/system.constants';

@Injectable()
export class SelfGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user; // Assuming the user object is added to the request by your authentication middleware
    const userIdParam = request.params.id; // The name 'id' should match the name of the path parameter

    if (!user) {
      throw new UnauthorizedException('You are not authenticated');
    }
  
    if (user.id !== userIdParam && user.role.name !== SYSTEM_CONST.ADMIN_ROLE) {
      throw new UnauthorizedException('You are not authorized to access this resource');
    }
    return true;
  }
}
