import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { API } from '../configs/zauto.endpoint';
import { JwtTokenService } from '../services/jwt-token.service';
import { AuthService } from 'src/microservices/base-services/auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly tokenService: JwtTokenService,
    private readonly authService:AuthService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authorizationHeader = request.headers['authorization'];

    if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Authorization token is missing');
    }

    
    const token = authorizationHeader.split(' ')[1];
    const tokenData = await this.validateTenant(token);

    if (!tokenData || !tokenData.orgId) {
      throw new UnauthorizedException('Authorization token is invalid');
    }

    request.orgId = tokenData.orgId;
    request.user = tokenData.user;
    return true;
  }

  private async validateTenant(
    token: string,
  ): Promise<{ orgId: string; user?: any } | null> {
    try {
      const payload = await this.tokenService.verifyAccessToken(token);

      if (payload.type === 'access-token') {
        return {
          orgId: payload.orgId,
        };
      }
    } catch (error) {
      // console.log(error);
    }

    if (process.env.NODE_ENV === 'production') {
      try {
        const user = await this.authService.verifyToken(token);
        
        if (!user || !user.orgId) {
          throw new UnauthorizedException('Invalid response data');
        }

        return {
          orgId: user.orgId,
          user: user,
        };
      } catch (error) {
        throw new UnauthorizedException('Error validating token');
      }
    } else {
      console.log(token);
      
      if (!token) {
        throw new UnauthorizedException('Authorization token is invalid');
      }
      return {
        orgId: token,
      };
    }
  }
}
