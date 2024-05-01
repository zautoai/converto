import { BadRequestException, ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/users/entities/user.entity';
import { PrismaService } from 'src/prisma/prisma.service';

import { EmailService } from 'src/common/services/email.service';
import { EMAIL_VERIFICATION_EXPIRES_TIME, SYSTEM_CONST } from 'src/common/constants/system.constants';
import { ChangePasswordDto } from './dto/change-password.dto';
import { RolesService } from 'src/roles/roles.service';
import { VerificationType } from 'src/common/enums/enums';
import { OrganizationsService } from 'src/organizations/organizations.service';
import { CreateOrgAccountDto } from 'src/account/dto/create-account.dto';
import { OrgAccountStatus } from 'src/common/enums/enums'; 
import { OrgAccountService } from 'src/account/account.service';

@Injectable()
export class RegistrationService {
  
  constructor(private readonly userService: UsersService,
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly roleService: RolesService,
    private readonly orgService: OrganizationsService,
    private readonly orgAccountService:OrgAccountService,
  ) {}

  async create(createUserDto: CreateUserDto) {

    const _user = await this.userService.findByEmail(createUserDto.email);
    const isValidEmail = await this.emailService.validateEmailDomain(createUserDto.email);
    if(!isValidEmail)
    {
      throw new BadRequestException(`The email address "${createUserDto.email}" is invalid or not allowed.`);
    }
    if(!_user) {
      //Step 1: Get Admin Role ID
      const adminRole = await this.roleService.findOneByName(SYSTEM_CONST.ADMIN_ROLE);
      if(!adminRole) {
        throw new NotFoundException('Admin role not found');
      }
      //Step 2: Assign admin role to user
      createUserDto.roleId = adminRole.id;

      //Step 3: Create Organization for the user
      const createOrgDto = {
        name: `${createUserDto.name}'s Organization`
      }
      const org = await this.orgService.create(createOrgDto);
      if(org) {
        createUserDto.orgId = org.id;
      } else {
        throw new NotFoundException('Organization not created');
      }

      // Setp 5: Select subscription
      const selectedPlan = await this.getSubscription("");
      if(!selectedPlan)
      {
        await this.orgService.remove(org.id);
        throw new BadRequestException("Unable to select subscription plan");
      }
      const createOrgAccountDto = new CreateOrgAccountDto();
      createOrgAccountDto.orgId = createUserDto.orgId;
      createOrgAccountDto.subscriptionId = selectedPlan.id;
      createOrgAccountDto.status = (selectedPlan.price == 0) ? OrgAccountStatus.ACTIVE : OrgAccountStatus.PENDING;
      const orgAccount = await this.orgAccountService.create(createOrgAccountDto);
      if(!orgAccount) {
        await this.orgService.remove(org.id);
        throw new NotFoundException('Organization account not created');
      }

      //Step 4: Create User Account
      const user = await this.userService.create(createUserDto);
      if(user) {
        return await this.createVerification(user);
      }
      else {
        //Step 4: Rollback all
        await this.orgService.remove(org.id);
        await this.orgAccountService.remove(orgAccount.orgId);
        throw new NotFoundException('Registration Failed');
      }
    } else {
      throw new ConflictException('Email already registered with another account.');
    }

    
  }

  async createVerification(user: any) {
    const verification = await this.prisma.verification.findFirst({where:{id: user.id}})
    if(!verification) {
      const verifyObj = await this.prisma.verification.create({data:{
        userId: user.id, token: uuidv4(), type: VerificationType.VERIFYEMAIL}
      });
      
      try
      {
        // send verification mail
        await this.emailService.sendVerifucationMail({...verifyObj, user});
      }
      catch(error)
      {
        console.error(error);
      }

      try
      {
        // send alert mail
        await this.emailService.sendSignupAleartMail({user});
      }
      catch(error)
      {
        console.error(error);
      }
      
      setTimeout(async () => {
        try {
          await this.prisma.verification.delete({where: {id: verifyObj.id}});
        } catch(error) {
          console.log(error)
        }
        
      }, EMAIL_VERIFICATION_EXPIRES_TIME * 60 * 60 * 1000);
    }
  }

  async verifyToken(token: string) {
    try {
      const verification = await this.prisma.verification.findFirst({where: {token}})
      if(verification) {
        await this.userService.verifyEmail(verification.userId);
        await this.prisma.verification.delete({where: {id: verification.id}});
        return {verified: true};
      } else {
        throw new UnauthorizedException('Token Expired or not found.')
      }
    } catch(error) {
      throw new BadRequestException('Token already verified/expired.')
    }
  }

  async sendForgotPassword(email: string) {
    try {
      const user = await this.userService.findByEmail(email);
      if(user) {
        const token = uuidv4();
        const verification  = await this.prisma.verification.create({data: {userId: user.id, token, type: VerificationType.FORGOTPASSWORD}});
        await this.emailService.sendVerifucationMail({...verification, user});
        return {success: true};
      } else {
        throw new NotFoundException('User email not found');
      }
    } catch(error) {
      console.log(error)
    }
  }

  async changePassword({password, token}) {
    try {
      const verification = await this.prisma.verification.findFirst({where: {token}})
      if(verification) {
        await this.userService.changePassword(verification.userId, password);
        await this.prisma.verification.delete({where: {id: verification.id}});
        return {success: true};
      } else {
        throw new UnauthorizedException('Token expired or not found.')
      }
    } catch(error) {
      console.log(error)
    }
  } 

  async resendVerification(email: string) {
    
    const user = await this.userService.findByEmail(email);
    
    const verification = await this.prisma.verification.findFirst({where:{id: user.id}})
    if(verification){
      await this.prisma.verification.delete({where: {id: verification.id}});
    }

    const verifyObj = await this.prisma.verification.create({data:{
      userId: user.id, token: uuidv4(), type: VerificationType.VERIFYEMAIL}
    });
    
    await this.emailService.sendVerifucationMail({...verifyObj, user});
    setTimeout(async () => {
      try {
        await this.prisma.verification.delete({where: {id: verifyObj.id}});
      } catch(error) {
        console.log(error)
      }
      
    }, EMAIL_VERIFICATION_EXPIRES_TIME * 60 * 60 * 1000);
  }

  async getSubscription(subId: string)
  {
    const subsPlan = await this.prisma.subscriptionPlan.findUnique({where:{id:subId}});
    if(subsPlan)
    {
      return subsPlan;
    }
    else
    {
      const freePlan = await this.prisma.subscriptionPlan.findFirst({where:{price:0}});
      return freePlan;
    }
  }
}
