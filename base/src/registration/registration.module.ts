import { Module } from '@nestjs/common';
import { RegistrationService } from './registration.service';
import { RegistrationController } from './registration.controller';
import { UsersModule } from 'src/users/users.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CommonModule } from 'src/common/common.module';
import { ForgotPasswordController } from './forgot-password.controller';
import { RolesModule } from 'src/roles/roles.module';
import { OrganizationsModule } from 'src/organizations/organizations.module';
import { AccountModule } from 'src/account/account.module';
import { CrmModule } from 'src/crm/crm.module';

@Module({
  imports: [
    UsersModule, 
    PrismaModule, 
    CommonModule, 
    RolesModule, 
    OrganizationsModule,
    AccountModule,
    CrmModule
  ],
  controllers: [RegistrationController, ForgotPasswordController],
  providers: [RegistrationService],
  exports: [RegistrationService]
})
export class RegistrationModule {}
