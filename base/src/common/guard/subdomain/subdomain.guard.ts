import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class SubdomainGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const orgId = request.headers['x-tenant-id'];
    if (orgId) {
      request.orgId = orgId;
      return true;
    }
    return false; 
  }
}
