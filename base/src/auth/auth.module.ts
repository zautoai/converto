import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AuthGuard, PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from 'src/users/users.module';
import { JwtStrategy } from './jwt.strategy';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from './roles.guard';
import { SelfGuard } from './self.guard';
import { RegistrationModule } from 'src/registration/registration.module';
import { CommonModule } from 'src/common/common.module';
import { OrganizationsModule } from 'src/organizations/organizations.module';

@Module({
  imports:[
    PrismaModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '7d' }, // e.g. 30s, 7d, 24h
    }),
    UsersModule,
    RegistrationModule,
    CommonModule,
    OrganizationsModule
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, JwtAuthGuard, RolesGuard, SelfGuard],
  exports: [JwtAuthGuard, RolesGuard, SelfGuard]
})
export class AuthModule {}
