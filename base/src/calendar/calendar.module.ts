import { Module } from '@nestjs/common';
import { CalendarService } from './calendar.service';
import { CalendarController } from './calendar.controller';
import { CalendarProvider } from './calendar.provider';
import { GoogleCalendarService } from './providers/google-calendar.service';
import { HttpModule } from '@nestjs/axios';
import { AvailabilityScheduleModule } from 'src/availability-schedule/availability-schedule.module';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports:[
    HttpModule,
    AvailabilityScheduleModule,
    PrismaModule
  ],
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
