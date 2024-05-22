import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class SubdomainGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const host = request.hostname;
    const subdomain = host.split('.')[0];
    const orgId = this.extractOrgIdFromSubdomain(subdomain);
    return !!orgId; 
  }

  private extractOrgIdFromSubdomain(subdomain: string): string | null {
    // Implement your logic to extract orgId from the subdomain
    // For example, if the subdomain is expected to be the orgId
    return subdomain;
  }
}
