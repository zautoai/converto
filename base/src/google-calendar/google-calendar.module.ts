import { Module } from '@nestjs/common';
import { GoogleCalendarService } from './google-calendar.service';
import { GoogleCalendarController } from './google-calendar.controller';
import { OauthModule } from 'src/oauth/oauth.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AvailabilityScheduleModule } from 'src/availability-schedule/availability-schedule.module';
import { CalendarController } from './calendar.controller';
import { LlmModule } from 'src/llm/llm.module';

@Module({
  imports: [
    LlmModule,
    OauthModule,
    PrismaModule,
    AvailabilityScheduleModule
  ],
  providers: [GoogleCalendarService],
  controllers: [GoogleCalendarController,CalendarController]
})
export class GoogleCalendarModule {}
