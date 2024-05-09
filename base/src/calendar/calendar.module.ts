import { Module } from '@nestjs/common';
import { CalendarService } from './calendar.service';
import { CalendarController } from './calendar.controller';
import { CalendarProvider } from './calendar.provider';
import { GoogleCalendarService } from './providers/google-calendar.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports:[HttpModule],
  controllers: [
    CalendarController,
  ],
  providers: [
    CalendarService,
    GoogleCalendarService,
    CalendarProvider
  ],
})
export class CalendarModule {}
