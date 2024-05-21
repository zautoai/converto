import { Module } from '@nestjs/common';
import { CampaignController } from './campaign.controller';
import { CampaignService } from './campaign.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AccountModule } from 'src/account/account.module';
import { ContactsModule } from 'src/contacts/contacts.module';

@Module({
  imports: [PrismaModule, AccountModule, ContactsModule],
  controllers: [CampaignController],
  providers: [CampaignService]

})
export class CampaignModule { }
