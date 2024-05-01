import { Module } from '@nestjs/common';
import { OrgAccountService } from './account.service';
import { OrgAccountController } from './account.controller';
import { UsageController } from './usage.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UsageService } from './usage.service';

@Module({
  imports:[PrismaModule],
  providers: [OrgAccountService,UsageService],
  controllers: [OrgAccountController,UsageController],
  exports:[UsageService,OrgAccountService]
})
export class AccountModule {}
