// roles.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      
      return true; // No roles required, allow access
    }
    
    const { user } = await context.switchToHttp().getRequest();
    if (!user) {
      return false; // User not found or not an instance of User
    }

    return requiredRoles.some((role) => {
        if(user.role && user.role.name == role) {
            return true;
        } else return false;
    });
  }
}
