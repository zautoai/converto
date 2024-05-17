import { Module } from '@nestjs/common';
import { StartupService } from './startup.service';
import { RolesModule } from 'src/roles/roles.module';
import { UsersModule } from 'src/users/users.module';
import { OrganizationsModule } from 'src/organizations/organizations.module';
import { HelpersModule } from 'src/helpers/helpers.module';
import { SubscriptionPlanModule } from 'src/subscription-plan/subscription-plan.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AccountModule } from 'src/account/account.module';
import { CommonModule } from 'src/common/common.module';
import { MicroservicesModule } from 'src/microservices/microservices.module';



@Module({
  imports: [
    PrismaModule,
    AccountModule,
    RolesModule,
    UsersModule,
    OrganizationsModule,
    HelpersModule,
    SubscriptionPlanModule,
    CommonModule,
    MicroservicesModule
  ],
  providers: [StartupService]
})
export class StartupModule { }
