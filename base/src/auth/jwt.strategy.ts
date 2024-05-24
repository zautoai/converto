//src/auth/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private usersService: UsersService,
    private readonly prisma: PrismaService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: any) {
    console.log('Payload is: ', payload)
    if (payload.type === 'access-token') {
      return {};
    }
    if (!payload.userId) {
      throw new UnauthorizedException();
    }
    const user = await this.usersService.getUserById(payload.orgId, payload.userId);
    if (!user || !user.verified) {
      console.log('Failing here')
      throw new UnauthorizedException();
    }
    return {
      ...user,
      orgId: payload.orgId
    };
  }
}