import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { AvailabilityScheduleService } from 'src/availability-schedule/availability-schedule.service';
import { BaseService } from 'src/common/services/base.service';
import { CalendarProvider } from './calendar.provider';
import { BookEventDto } from './dto/book-event.dto';
import { CalendarName } from './enum/calendar.enum';
import { CalendarEvent } from './interface/event.interface';
import { EventSlot } from './interface/slot.interface';
import { AvailabilitySchedule } from './slot.model';
import { ServiceParams } from 'src/common/models/service-param.model';

@Injectable()
export class CalendarService extends BaseService {

    private readonly daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    constructor(
        private readonly provide: CalendarProvider,
        private readonly availabilityScheduleService: AvailabilityScheduleService
    ) {
        super();
    }

    getAuthUrl(serviceParams: ServiceParams<{ calendarName: string, additionalInfo: any }>) {
        try {
            const { orgId, data: { calendarName, additionalInfo } } = serviceParams
            const calendar = this.provide.getCalendar(calendarName);
            const authUrl = calendar.getAuthUrl(orgId, additionalInfo);
            return { url: authUrl }
        }
        catch (err) {
            throw new InternalServerErrorException(err.message);
        }
    }
    async exchangeCodeForAccessToken(serviceParams: ServiceParams<{ calendarName: string, code: string }>): Promise<any> {
        try {
            const { orgId, data: { calendarName, code } } = serviceParams;
            const calendar = this.provide.getCalendar(calendarName);
            return await calendar.exchangeCodeForAccessToken({ orgId, data: { code } });
        }
        catch (err) {
            throw new InternalServerErrorException(err.message);
        }
    }
    async exchangeRefreshTokenForAccessToken(serviceParams: ServiceParams<{ calendarName: string, refreshToken: string }>): Promise<any> {
        try {
            const { orgId, data: { calendarName, refreshToken } } = serviceParams;
            const calendar = this.provide.getCalendar(calendarName);
            return await calendar.exchangeRefreshTokenForAccessToken({ orgId, data: { refreshToken } });
        }
        catch (err) {
            throw new InternalServerErrorException(err.message);
        }
    }

    async getAccessToken(serviceParams: ServiceParams<{ calendarName: string }>): Promise<any> {
        try {
            const { orgId, data: { calendarName } } = serviceParams;
            const calendar = this.provide.getCalendar(calendarName);
            return await calendar.getAccessToken(orgId);
        }
        catch (err) {
            throw new InternalServerErrorException(err.message);
        }
    }
    async revokeAccess(serviceParams: ServiceParams<{ calendarName: string }>): Promise<any> {
        try {
            const { orgId, data: { calendarName } } = serviceParams;
            const calendar = this.provide.getCalendar(calendarName);
            return await calendar.revokeAccess(orgId);
        }
        catch (err) {
            throw new InternalServerErrorException(err.message);
        }
    }

    async getProfile(serviceParams: ServiceParams<{ calendarName: string }>): Promise<any> {
        try {
            const { orgId, data: { calendarName } } = serviceParams;
            const calendar = this.provide.getCalendar(calendarName);
            return await calendar.getProfile(orgId);
        }
        catch (err) {
            throw new InternalServerErrorException(err.message);
        }
    }

    async getActiveCalendarName(orgId: string): Promise<string> {
        return CalendarName.GOOGLE
    }

    async getCalendars(orgId: string): Promise<any> {
        try {
            const calendarName = await this.getActiveCalendarName(orgId);
            const calendar = this.provide.getCalendar(calendarName);
            return await calendar.getCalendars(orgId);
        }
        catch (err) {
            throw new InternalServerErrorException(err.message);
        }
    }

    async getCalendarId(orgId: string): Promise<string> {
        try {
            const calendarId = (await this.availabilityScheduleService.findOne(orgId)).calendarId;
            if (!calendarId) {
                throw new NotFoundException('Calendar id not found');
            }
            return calendarId;
        }
        catch (err) {
            throw new InternalServerErrorException(err.message);
        }
    }

    async getEvents(serviceParams: ServiceParams<{ date: string }>): Promise<any> {
        try {
            const { orgId, data: { date } } = serviceParams;
            const calendarName = await this.getActiveCalendarName(orgId);
            const calendarId = await this.getCalendarId(orgId);
            const calendar = this.provide.getCalendar(calendarName);
            const { timeMin, timeMax } = this.getStartEndTimesForDay(new Date(date));
            return await calendar.getEvents({ orgId, data: { calendarId, startDate: timeMin, endDate: timeMax } });
        }
        catch (err) {
            this.logger.error(err);
            throw new InternalServerErrorException(err.message);
        }
    }

    async getEventById(serviceParams: ServiceParams<{ eventId: string }>): Promise<any> {
        try {
            const { orgId, data: { eventId } } = serviceParams;
            const calendarName = await this.getActiveCalendarName(orgId);
            const calendarId = await this.getCalendarId(orgId);
            const calendar = this.provide.getCalendar(calendarName);
            return await calendar.getEventById({ orgId, data: { calendarId, eventId } });
        }
        catch (err) {
            throw new InternalServerErrorException(err.message);
        }
    }

    async addEvent(serviceParams: ServiceParams<{ event: CalendarEvent }>): Promise<any> {
        try {
            const { orgId, data: { event } } = serviceParams;
            const calendarName = await this.getActiveCalendarName(orgId);
            const calendarId = await this.getCalendarId(orgId);
            const calendar = this.provide.getCalendar(calendarName);
            return await calendar.addEvent({ orgId, data: { calendarId, event } });
        }
        catch (err) {
            throw new InternalServerErrorException(err.message);
        }
    }

    async updateEvent(serviceParams: ServiceParams<{ eventId: string, event: CalendarEvent }>): Promise<any> {
        try {
            const { orgId, data: { eventId, event } } = serviceParams;
            const calendarName = await this.getActiveCalendarName(orgId);
            const calendarId = await this.getCalendarId(orgId);
            const calendar = this.provide.getCalendar(calendarName);
            const existingEvent = await calendar.getEventById({ orgId, data: { calendarId, eventId } });
            if (!existingEvent) return null;
            return await calendar.updateEvent({ orgId, data: { calendarId, eventId, event } });
        }
        catch (err) {
            throw new InternalServerErrorException(err.message);
        }
    }

    async deleteEvent(serviceParams: ServiceParams<{ eventId: string }>): Promise<any> {
        try {
            const { orgId, data: { eventId } } = serviceParams;
            const calendarName = await this.getActiveCalendarName(orgId);
            const calendarId = await this.getCalendarId(orgId);
            const calendar = this.provide.getCalendar(calendarName);
            const existingEvent = await calendar.getEventById({ orgId, data: { calendarId, eventId } });
            if (!existingEvent) return null;
            return await calendar.removeEvent({ orgId, data: { calendarId, eventId } });
        }
        catch (err) {
            throw new InternalServerErrorException(err.message);
        }
    }

    async getFreeBusy(serviceParams: ServiceParams<{ startDate: string, endDate: string }>): Promise<any> {
        try {
            const { orgId, data: { startDate, endDate } } = serviceParams;
            const calendarName = await this.getActiveCalendarName(orgId);
            const calendarId = await this.getCalendarId(orgId);
            const calendar = this.provide.getCalendar(calendarName);
            return await calendar.getFreeBusy({ orgId, data: { calendarId, startDate, endDate } });
        }
        catch (err) {
            throw new InternalServerErrorException(err.message);
        }
    }

    async getAvailabilitySchedule(orgId: string): Promise<AvailabilitySchedule> {
        try {
            const schedule = await this.availabilityScheduleService.findOne(orgId);
            let availabilitySchedule: AvailabilitySchedule = {
                availableDays: schedule.availableDays.split(','),
                availableHours: schedule.availableHours,
                eventDuration: schedule.eventDuration
            };
            return availabilitySchedule;
        }
        catch (err) {
            return null;
        }
    }

    async getAvailableDates(orgId: string) {
        const { availableDays } = await this.getAvailabilitySchedule(orgId);
        const currentDate = new Date();
        const availableDates: Date[] = [];
        let i = 0;
        while (availableDates.length < 9) {
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

    async getSlots(serviceParams: ServiceParams<{ _date: string }>) {
        const { orgId, data: { _date } } = serviceParams;
        const date = new Date(_date);
        const { availableDays, availableHours, eventDuration } = await this.getAvailabilitySchedule(orgId);
        const slots: EventSlot[] = [];
        const dayIndex = new Date(date).getDay().toString();
        const day = this.daysOfWeek[dayIndex];
        if (!availableDays.includes(day)) return slots;
        const { timeMin, timeMax } = this.getStartEndTimesForDay(date);
        const busyTimes = await this.getFreeBusy({ orgId, data: { startDate: timeMin, endDate: timeMax } });
        const dayOfWeek = this.daysOfWeek.indexOf(day);
        if (dayOfWeek !== -1) {
            availableHours.forEach(hour => {
                const [startHour, startMinute] = hour.start.split(':').map(Number);
                const [endHour, endMinute] = hour.end.split(':').map(Number);
                const currentDate = new Date(date.getTime());
                currentDate.setHours(startHour, startMinute);
                while (currentDate.getHours() < endHour || (currentDate.getHours() === endHour && currentDate.getMinutes() < endMinute)) {
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

    getStartEndTimesForDay(date: Date): { timeMin: string; timeMax: string } {
        const targetDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        const timeMin = new Date(targetDate.setUTCHours(0, 0, 0, 0)).toISOString();
        const timeMax = new Date(targetDate.setUTCHours(23, 59, 59, 999)).toISOString();

        return { timeMin, timeMax };
    }
}
