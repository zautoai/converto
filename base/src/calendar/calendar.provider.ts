import { Injectable } from '@nestjs/common';
import { GoogleCalendarService } from './providers/google-calendar.service';
import { BaseCalendar } from './calendar.model';
import { CalendarName } from './enum/calendar.enum';

@Injectable()
export class CalendarProvider {

    providers: { [key: string]: BaseCalendar } = {};

    constructor(
        private readonly googleCalendarService: GoogleCalendarService
    ){
        this.providers[CalendarName.GOOGLE] = this.googleCalendarService;
    }

    getCalendar(name:string)
    {
        try
        {
            return this.providers[name];
        }
        catch(e)
        {
            throw new Error(`Calendar ${name} not found`);
        }
    }
}
