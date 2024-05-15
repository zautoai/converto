import { Injectable, InternalServerErrorException, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { CalendarProvider } from './calendar.provider';
import { AvailabilityScheduleService } from 'src/availability-schedule/availability-schedule.service';
import { AvailabilitySchedule } from 'src/google-calendar/entites/slot.model';
import { CalendarName } from './enum/calendar.enum';
import { CalendarEvent } from './interface/event.interface';
import { EventSlot } from './interface/slot.interface';
import { PrismaService } from 'src/prisma/prisma.service';
import { BookEventDto } from './dto/book-event.dto';

@Injectable()
export class CalendarService implements OnModuleInit{

    private readonly logger = new Logger(CalendarService.name);

    // private readonly calendarId = "781c5c0a430bb1b48df3d59df73274b7b047589c42ffe3f92abb48d0997474cf@group.calendar.google.com";
    private readonly orgId = "a3ccfcf5-4e1c-43bd-a1c1-1e30c236ca26";
    private readonly daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    constructor(
        private readonly prisma: PrismaService,
        private readonly provide: CalendarProvider,
        private readonly availabilityScheduleService: AvailabilityScheduleService
    ){}

    async onModuleInit() {
        // const events = await this.getEvents(this.orgId, CalendarName.GOOGLE, '2024-05-14');
        // console.log(events);
        // const event = await this.getEventById(this.orgId, CalendarName.GOOGLE, '5dm05tslrs236d9hehs5m4tvfo');
        // console.log(event);        
        // const event = await this.addEvent(this.orgId, CalendarName.GOOGLE, {
        //     title: 'Team Meeting',
        //     description: 'Discuss project status and upcoming tasks',
        //     start: '2024-05-14T12:00:00+05:30',
        //     end: '2024-05-14T13:00:00+05:30',
        // }); 
        // console.log(event);
        // const event = await this.updateEvent(this.orgId, CalendarName.GOOGLE, '5dm05tslrs236d9hehs5m4tvfo', {
        //     title: 'Updated Test Event',
        //     description: 'Discuss project status and upcoming tasks',
        //     start: '2024-05-14T12:00:00+05:30',
        //     end: '2024-05-14T13:00:00+05:30',
        // })
        // console.log(event);
        // const event = await this.deleteEvent(this.orgId, CalendarName.GOOGLE, 'm7idu03ohbqfv5s0eaojfgkkck');
        // console.log(event); 
        // const availabilitySchedule = await this.getAvailabilitySchedule(this.orgId);
        // console.log(availabilitySchedule);      
        // const slot = await this.getSlots(this.orgId,'2024-05-14');
        // console.log(slot.length); 
    }

    getAuthUrl(orgId: string, calendarName:string, additionalInfo: any) {
        try
        {
            const calendar = this.provide.getCalendar(calendarName);
            const authUrl = calendar.getAuthUrl(orgId,additionalInfo);
            return { url:authUrl} 
        }
        catch(err)
        {
            throw new InternalServerErrorException(err.message);
        }
    }
    async exchangeCodeForAccessToken(orgId: string, calendarName:string, code: string): Promise<any> {
        try
        {
            const calendar = this.provide.getCalendar(calendarName);
            return await calendar.exchangeCodeForAccessToken(orgId,code);
        }
        catch(err)
        {
            throw new InternalServerErrorException(err.message);
        }
    }
    async exchangeRefreshTokenForAccessToken(orgId: string, calendarName:string, refreshToken: string): Promise<any> {
        try
        {
            const calendar = this.provide.getCalendar(calendarName);
            return await calendar.exchangeRefreshTokenForAccessToken(orgId,refreshToken);
        }
        catch(err)
        {
            throw new InternalServerErrorException(err.message);
        }
    }

    async getAccessToken(orgId: string, calendarName:string): Promise<any> {
        try
        {
            const calendar = this.provide.getCalendar(calendarName);
            return await calendar.getAccessToken(orgId);
        }
        catch(err)
        {
            throw new InternalServerErrorException(err.message);
        }
    }
    async revokeAccess(orgId: string, calendarName:string): Promise<any> {
        try
        {
            const calendar = this.provide.getCalendar(calendarName);
            return await calendar.revokeAccess(orgId);
        }
        catch(err)
        {
            throw new InternalServerErrorException(err.message);
        }
    }

    async getProfile(orgId: string, calendarName:string): Promise<any> {
        try
        {
            const calendar = this.provide.getCalendar(calendarName);
            return await calendar.getProfile(orgId);
        }
        catch(err)
        {
            throw new InternalServerErrorException(err.message);
        }
    }

    async getActiveCalendarName(orgId:string):Promise<string>
    {
        return CalendarName.GOOGLE
    }

    async getCalendarId(orgId: string): Promise<string> {
        try
        {
            const calendarId = (await this.availabilityScheduleService.findByOrg(orgId)).calendarId;
            if(!calendarId)
            {
                throw new NotFoundException('Calendar id not found');
            }
            return calendarId;
        }
        catch(err)
        {
            throw new InternalServerErrorException(err.message);
        }
    }

    async getEvents(orgId: string, date: string): Promise<any> {
        try
        {
            const calendarName = await this.getActiveCalendarName(orgId);
            const calendarId = await this.getCalendarId(orgId);
            const calendar = this.provide.getCalendar(calendarName);
            const {timeMin,timeMax} = this.getStartEndTimesForDay(new Date(date));
            return await calendar.getEvents(orgId,calendarId,timeMin, timeMax); 
        }
        catch(err)
        {
            this.logger.error(err);
            throw new InternalServerErrorException(err.message);
        }
    }

    async getEventById(orgId: string, eventId: string): Promise<any> {
        try
        {
            const calendarName = await this.getActiveCalendarName(orgId);
            const calendarId = await this.getCalendarId(orgId);
            const calendar = this.provide.getCalendar(calendarName);
            return await calendar.getEventById(orgId, calendarId,eventId);
        }
        catch(err)
        {
            throw new InternalServerErrorException(err.message);
        }
    }

    async addEvent(orgId: string, event: CalendarEvent): Promise<any> {
        try
        {
            const calendarName = await this.getActiveCalendarName(orgId);
            const calendarId = await this.getCalendarId(orgId);
            const calendar = this.provide.getCalendar(calendarName);
            return await calendar.addEvent(orgId, calendarId, event);
        }
        catch(err)
        {
            throw new InternalServerErrorException(err.message);
        }
    }

    async updateEvent(orgId: string, eventId: string, event: CalendarEvent): Promise<any> {
        try
        {
            const calendarName = await this.getActiveCalendarName(orgId);
            const calendarId = await this.getCalendarId(orgId);
            const calendar = this.provide.getCalendar(calendarName); 
            const existingEvent = await calendar.getEventById(orgId, calendarId, eventId);
            if(!existingEvent) return null;
            return await calendar.updateEvent(orgId, calendarId, eventId, event);
        }
        catch(err)
        {
            throw new InternalServerErrorException(err.message);
        }
    }

    async deleteEvent(orgId: string, eventId: string): Promise<any> {
        try
        {
            const calendarName = await this.getActiveCalendarName(orgId);
            const calendarId = await this.getCalendarId(orgId);
            const calendar = this.provide.getCalendar(calendarName);
            const existingEvent = await calendar.getEventById(orgId, calendarId, eventId);
            if(!existingEvent) return null;
            return await calendar.removeEvent(orgId, calendarId, eventId);
        }
        catch(err)
        {
            throw new InternalServerErrorException(err.message);
        }
    }

    async getFreeBusy(orgId: string, startDate: string, endDate: string): Promise<any> {
        try
        {
            const calendarName = await this.getActiveCalendarName(orgId);
            const calendarId = await this.getCalendarId(orgId);
            const calendar = this.provide.getCalendar(calendarName);
            return await calendar.getFreeBusy(orgId, calendarId, startDate, endDate);
        }
        catch(err)
        {
            throw new InternalServerErrorException(err.message);
        }
    }

    async getAvailabilitySchedule(orgId: string): Promise<AvailabilitySchedule> {
        try
        {
            const schedule = await this.availabilityScheduleService.findByOrg(orgId);
            let availabilitySchedule: AvailabilitySchedule = {
                availableDays: schedule.availableDays.split(','),
                availableHours: schedule.availableHours,
                eventDuration: schedule.eventDuration
            };
            return availabilitySchedule;
        }
        catch(err)
        {
            return null;
        }
    } 

    async getAvailableDates(orgId: string)
    {
        const { availableDays } = await this.getAvailabilitySchedule(orgId);
        const currentDate = new Date();
        const availableDates: Date[] = [];
        let i = 0;
        while (availableDates.length < 9)
        {
            const nextDate = new Date(currentDate);
            nextDate.setDate(currentDate.getDate() + i);
            const dayIndex = nextDate.getDay().toString();
            const day = this.daysOfWeek[dayIndex];
            if (availableDays.includes(day)) {
                availableDates.push(nextDate);
            }
            i++;   
        }
        return availableDates;
    }

    async getSlots(orgId: string, _date: string) {
        const date = new Date(_date);
        const { availableDays, availableHours, eventDuration } = await this.getAvailabilitySchedule(orgId); 
        const slots: EventSlot[] = [];  
        const dayIndex = new Date(date).getDay().toString();
        const day = this.daysOfWeek[dayIndex];
        if (!availableDays.includes(day)) return slots;
        const { timeMin, timeMax } = this.getStartEndTimesForDay(date);
        const busyTimes = await this.getFreeBusy(orgId, timeMin, timeMax);
        const dayOfWeek = this.daysOfWeek.indexOf(day);
        if (dayOfWeek !== -1) 
        {
            availableHours.forEach(hour => {
                const [startHour, startMinute] = hour.start.split(':').map(Number);
                const [endHour, endMinute] = hour.end.split(':').map(Number);
                const currentDate = new Date(date.getTime());
                currentDate.setHours(startHour, startMinute);     
                while (currentDate.getHours() < endHour || (currentDate.getHours() === endHour && currentDate.getMinutes() < endMinute))
                {
                    const slotStart = new Date(currentDate.getTime());
                    const slotEnd = new Date(currentDate.getTime() + eventDuration * 60000);
                    const isSlotBusy = busyTimes.some(busySlot => {
                        const busyStart = new Date(busySlot.start);
                        const busyEnd = new Date(busySlot.end);
                        return (slotStart < busyEnd && slotEnd > busyStart);
                    });
                    if (!isSlotBusy) {
                        slots.push({ start: slotStart.toISOString(), end: slotEnd.toISOString() });
                    }
                    currentDate.setTime(currentDate.getTime() + eventDuration * 60000);
                }         
            });            
        }
        return slots;
    }

    async getAvailableSlotsByAgent(agentId: string, date: string)
    {
        const agent = await this.prisma.agent.findUnique({ where: { id: agentId } });
        if (!agent) {
            throw new NotFoundException('agent not found');
        }
        const { orgId } = agent;
        return await this.getSlots(orgId, date);
    }

    async getAvailableDatesByAgent(agentId: string)
    {
        const agent = await this.prisma.agent.findUnique({ where: { id: agentId } });
        if (!agent) {
            throw new NotFoundException('agent not found');
        }
        const { orgId } = agent;
        return await this.getAvailableDates(orgId);
    }

    async bookEventByAgent(agentId: string, bookEventDto: BookEventDto)
    {
        const agent = await this.prisma.agent.findUnique({ where: { id: agentId } });
        if (!agent) {
            throw new NotFoundException('agent not found');
        }
        const { orgId } = agent;
        await this.addEvent(orgId, bookEventDto);
        return {
            statusCode: 200,
            status: true,
            message: 'Event booked successfully'
        }        
    }

    getStartEndTimesForDay(date: Date): { timeMin: string; timeMax: string } {
        const targetDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        const timeMin = new Date(targetDate.setUTCHours(0, 0, 0, 0)).toISOString();
        const timeMax = new Date(targetDate.setUTCHours(23, 59, 59, 999)).toISOString();

        return { timeMin, timeMax };
    }
}
