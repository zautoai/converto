import { Module } from '@nestjs/common';
import { CampaignController } from './campaign.controller';
import { CampaignService } from './campaign.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CampaignAgentController } from './campaign-agent.controller';
import { AccountModule } from 'src/account/account.module';

@Module({
  imports:[PrismaModule,AccountModule],
  controllers: [CampaignController,CampaignAgentController],
  providers: [CampaignService]
  
})
export class CampaignModule {}
