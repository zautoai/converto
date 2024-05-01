import { Module } from '@nestjs/common';
import { LeadConfigService } from './lead-config.service';
import { LeadConfigController } from './lead-config.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AgentModule } from 'src/agent/agent.module';

@Module({
  imports: [PrismaModule, AgentModule],
  controllers: [LeadConfigController],
  providers: [LeadConfigService],
})
export class LeadConfigModule {}
