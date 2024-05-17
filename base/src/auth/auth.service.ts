//src/auth/auth.service.ts
import {
    Injectable,
    NotFoundException,
    UnauthorizedException,
  } from '@nestjs/common';
  import { JwtService } from '@nestjs/jwt';
  import { AuthEntity } from './entities/auth.entity';
  import * as bcrypt from 'bcrypt';
import { UsersService } from 'src/users/users.service';
import { PrismaClientManager } from 'src/prisma/prisma-client-manager.service';
import { OrganizationsService } from 'src/organizations/organizations.service';
import { DEFAULT_SCHEMA_NAME } from 'src/common/constants/system.constants';

  
  @Injectable()
  export class AuthService {
    constructor(
      private jwtService: JwtService,
      private userService: UsersService,
      private readonly organizationService: OrganizationsService,
      private readonly prismaClientManager: PrismaClientManager) {}
  
    async login(email: string, password: string): Promise<AuthEntity> {
      const org = await this.organizationService.findOrgByEmail(email)
      if(!org) {
        throw new NotFoundException(`No organization found for email: ${email}`);
      }
      const prisma = await this.prismaClientManager.getClient(org.id);
      // Step 1: Fetch a user with the given email
      const user = await prisma.user.findUnique({ where: { email: email }});
  
      // If no user is found, throw an error
      if (!user) {
        throw new NotFoundException(`No user found for email: ${email}`);
      }
  
      // Step 2: Check if the password is correct
      const isPasswordValid = await bcrypt.compare(password, user.password);
  
      // If password does not match, throw an error
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid password');
      }

      //Step 3: If Account not verified then return unauthorised
      if(user && !user.verified) {
        //await this.regService.createVerification(user)
        throw new UnauthorizedException('Account not verified');
      }
      // Step 4: Generate a JWT containing the user's ID and return it
      return {
        accessToken: this.jwtService.sign({ userId: user.id, orgId: org.id , orgName: org.name  }),
        user: await this.userService.findOne(org.id,user.id),
        avatar: await prisma.agent.findFirst({where: {orgId: org.id}})
      };
    }

    async getUserInfo(user: any) {
      const prisma = await this.prismaClientManager.getClient(user.org.id);
      return {
        user: await this.userService.findOne(user.org.id,user.id),
        avatar: await prisma.agent.findFirst({where: {orgId: user.org.id}})
      };
    }

    async verifyToken(token:string)
    {
      const decoded = await this.jwtService.verify(token,{secret:process.env.JWT_SECRET});
      const prisma = await this.prismaClientManager.getClient(decoded.orgId);
      const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
      if (!user) {
        throw new NotFoundException(`No user found for id: ${decoded.userId}`);
      }
      return user;
    }
  }