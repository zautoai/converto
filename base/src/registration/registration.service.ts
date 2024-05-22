import { BadRequestException, ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UsersService } from 'src/users/users.service';
import { EmailService } from 'src/common/services/email.service';
import { DEFAULT_SCHEMA_NAME, EMAIL_VERIFICATION_EXPIRES_TIME, SYSTEM_CONST } from 'src/common/constants/system.constants';
import { RolesService } from 'src/roles/roles.service';
import { VerificationType } from 'src/common/enums/enums';
import { OrganizationsService } from 'src/organizations/organizations.service';
import { PrismaClientManager } from 'src/prisma/prisma-client-manager.service';

@Injectable()
export class RegistrationService {
  
  constructor(private readonly userService: UsersService,
    private readonly emailService: EmailService,
    private readonly roleService: RolesService,
    private readonly orgService: OrganizationsService,
    private readonly prismaClientManager: PrismaClientManager
  ) {}

  async findOrgByEmail(email: string) {
    const prisma = await this.prismaClientManager.getClient(DEFAULT_SCHEMA_NAME);
    return await prisma.organization.findFirst({
      where: {
        emails:{
          hasSome:[email]
        }
      }
    })
  }

  async create(createUserDto: CreateUserDto) {

    const _org = await this.findOrgByEmail(createUserDto.email);
    // const isValidEmail = await this.emailService.validateEmailDomain(createUserDto.email);
    // if(!isValidEmail)
    // {
    //   throw new BadRequestException(`The email address "${createUserDto.email}" is invalid or not allowed.`);
    // }
    if(!_org) {

      //Step 3: Create Organization for the user
      const createOrgDto = {
        name: `${createUserDto.name}'s Organization`,
        emails: [createUserDto.email]
      }
      const org = await this.orgService.create(createOrgDto);
      if(org) {
        createUserDto.orgId = org.id; 
      } else {
        throw new NotFoundException('Organization not created');
      }

      //Step 1: Get Admin Role ID
      const adminRole = await this.roleService.findOneByName(org.id,SYSTEM_CONST.ADMIN_ROLE);
      if(!adminRole) {
        throw new NotFoundException('Admin role not found');
      }
      //Step 2: Assign admin role to user
      createUserDto.roleId = adminRole.id;


      // Setp 5: Select subscription
      // const selectedPlan = await this.getSubscription("");
      // if(!selectedPlan)
      // {
      //   await this.orgService.remove(org.id);
      //   throw new BadRequestException("Unable to select subscription plan");
      // }
      // const createOrgAccountDto = new CreateOrgAccountDto();
      // createOrgAccountDto.orgId = createUserDto.orgId;
      // createOrgAccountDto.subscriptionId = selectedPlan.id;
      // createOrgAccountDto.status = (selectedPlan.price == 0) ? OrgAccountStatus.ACTIVE : OrgAccountStatus.PENDING;
      // const orgAccount = await this.orgAccountService.create(createOrgAccountDto);
      // if(!orgAccount) {
      //   await this.orgService.remove(org.id);
      //   throw new NotFoundException('Organization account not created');
      // }

      //Step 4: Create User Account
      const user = await this.userService.create(org.id,createUserDto);
      if(user) {
        return await this.createVerification(user);
      }
      else {
        //Step 4: Rollback all
        await this.orgService.remove(org.id);
        // await this.orgAccountService.remove(orgAccount.orgId);
        throw new NotFoundException('Registration Failed');
      }
    } else {
      throw new ConflictException('Email already registered with another account.');
    }

    
  }

  async createVerification(user: any) {
    const prisma = await this.prismaClientManager.getClient(DEFAULT_SCHEMA_NAME);
    const verification = await prisma.verification.findFirst({where:{id: user.id}})
    if(!verification) {
      const verifyObj = await prisma.verification.create({data:{
        userId: user.id, token: uuidv4(), 
        email: user.email,
        type: VerificationType.VERIFYEMAIL}
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
          const prisma = await this.prismaClientManager.getClient(DEFAULT_SCHEMA_NAME);
          await prisma.verification.delete({where: {id: verifyObj.id}});
        } catch(error) {
          console.log(error)
        }
        
      }, EMAIL_VERIFICATION_EXPIRES_TIME * 60 * 60 * 1000);
    }
  }

  async verifyToken(token: string) {
    try {
      const prisma = await this.prismaClientManager.getClient(DEFAULT_SCHEMA_NAME);
      const verification = await prisma.verification.findFirst({where: {token}});
      const org = await this.findOrgByEmail(verification.email);
      if(!org) {
        throw new NotFoundException('Organization not found');
      }
      if(verification) {
        await this.userService.verifyEmail(org.id,verification.userId);
        await prisma.verification.delete({where: {id: verification.id}});
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
      const org = await this.findOrgByEmail(email);
      if(!org) {
        throw new NotFoundException('Organization not found');
      }
      const user = await this.userService.findByEmail(org.id,email);
      if(user) {
        const token = uuidv4();
        const prisma = await this.prismaClientManager.getClient(DEFAULT_SCHEMA_NAME);
        const verification  = await prisma.verification.create({data: {userId: user.id, email: user.email,token, type: VerificationType.FORGOTPASSWORD}});
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
      const prisma = await this.prismaClientManager.getClient(DEFAULT_SCHEMA_NAME);
      const verification = await prisma.verification.findFirst({where: {token}})
      const org = await this.findOrgByEmail(verification.email);
      if(!org) {
        throw new NotFoundException('Organization not found');
      }
      if(verification) {
        await this.userService.changePassword(org.id,verification.userId, password);
        await prisma.verification.delete({where: {id: verification.id}});
        return {success: true};
      } else {
        throw new UnauthorizedException('Token expired or not found.')
      }
    } catch(error) {
      console.log(error)
    }
  } 

  async resendVerification(email: string) {
    
    const org = await this.findOrgByEmail(email);
    if(org) {
      throw new BadRequestException('Email already registered with another account.');
    }
    const user = await this.userService.findByEmail(org.id,email);
    const prisma = await this.prismaClientManager.getClient(DEFAULT_SCHEMA_NAME);
    const verification = await prisma.verification.findFirst({where:{id: user.id}})
    if(verification){
      await prisma.verification.delete({where: {id: verification.id}});
    }

    const verifyObj = await prisma.verification.create({data:{
      userId: user.id, email: user.email,token: uuidv4(), type: VerificationType.VERIFYEMAIL}
    });
    
    await this.emailService.sendVerifucationMail({...verifyObj, user});
    setTimeout(async () => {
      try {
        await prisma.verification.delete({where: {id: verifyObj.id}});
      } catch(error) {
        console.log(error)
      }
      
    }, EMAIL_VERIFICATION_EXPIRES_TIME * 60 * 60 * 1000);
  }

}
