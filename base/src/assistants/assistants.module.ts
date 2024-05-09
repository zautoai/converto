import { Module } from '@nestjs/common';
import { LeadObsorverService } from './services/lead-obsorver.service';
import { LlmModule } from 'src/llm/llm.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { SummarizerService } from './services/summarizer.service';
import { PageGreeterService } from './services/page-greeters.service';
import { HelpersModule } from 'src/helpers/helpers.module';
import { CTACreatorService } from './services/cta-creator';
import { CTASelectorService } from './services/cta-selector';
import { CommonModule } from 'src/common/common.module';
import { EndOfConversationService } from './services/endconversation.service';
import { CalendarObsorverService } from './services/calendar-obsorver.service';
import { StarterGeneratorService } from './services/starters-generator.service';

@Module({
  imports: [LlmModule, PrismaModule, HelpersModule, CommonModule],
  providers: [
    LeadObsorverService, 
    SummarizerService,
    PageGreeterService, 
    CTACreatorService,
    CTASelectorService,
    EndOfConversationService,
    CalendarObsorverService,
    StarterGeneratorService
  ],
  exports: [
    SummarizerService,
    PageGreeterService,
    CTACreatorService,
    StarterGeneratorService
  ]
})
export class AssistantsModule {}
 