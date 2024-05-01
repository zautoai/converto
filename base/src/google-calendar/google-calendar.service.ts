import { BadRequestException, Injectable, NotAcceptableException, NotFoundException, OnModuleInit } from '@nestjs/common';
import { OauthService } from 'src/oauth/oauth.service';
import { google, Auth } from 'googleapis';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { FreeBusyRequestDto } from './dto/freebusy.dto';
import { AvailabilitySchedule } from './entites/slot.model';
import { AvailabilityScheduleService } from 'src/availability-schedule/availability-schedule.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { SYSTEM_CONST } from 'src/common/constants/system.constants';
import { SCHEDULE_SUMMERIZER_PROMPT_TEMPLATE } from 'src/common/templates/calendar-obsorver.template';
import { LlmService } from 'src/llm/llm.service';
import { extractJsonFromMarkdown } from 'src/common/helpers/extractJson.helper';


@Injectable()
export class GoogleCalendarService{

    private oauth2Client: Auth.OAuth2Client;
    private readonly daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    private readonly calendarId = 'primary';

    constructor(
        private readonly llmService: LlmService,
        private readonly prisma: PrismaService,
        private readonly oAuthService: OauthService,
        private readonly availabilityScheduleService: AvailabilityScheduleService
    ) { }

    async getPrimaryUser(orgId: string) {

        const primaryUser = await this.prisma.user.findFirst({
            where: {
                orgId: orgId,
                role: {
                    OR: [
                        {
                            name: SYSTEM_CONST.ADMIN_ROLE
                        },
                        {
                            name: SYSTEM_CONST.SUPERUSER_ROLE
                        }
                    ]
                }
            }
        });
        if (!primaryUser) {
            throw new NotFoundException('Primary user not found.');
        }
        return primaryUser;
    }

    async getCalendar(orgId: string, userId: string) {
        const tokenData = await this.oAuthService.getAccessToken(orgId, 'google', userId);
        if (!tokenData.accessToken) {
            throw new NotFoundException('access token missing');
        }
        const accessToken = tokenData.accessToken;

        this.oauth2Client = new google.auth.OAuth2();
        this.oauth2Client.setCredentials({
            access_token: accessToken,
        });

        const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });
        const response = await calendar.calendarList.list();
        return response.data;
    }

    async getEvents(orgId: string, userId: string,date:string) {
        const tokenData = await this.oAuthService.getAccessToken(orgId, 'google', userId);
        if (!tokenData) {
            throw new NotFoundException('Access token missing');
        }
        const accessToken = tokenData.accessToken;

        this.oauth2Client = new google.auth.OAuth2();
        this.oauth2Client.setCredentials({
            access_token: accessToken,
        });
        const selectedDate = this.getStartEndTimesForDay(new Date(date));        
        const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });
        const calendarId = await this.getCalendarId(orgId);
        const response = await calendar.events.list({
            calendarId: calendarId,
            timeMin: selectedDate.timeMin,
            timeMax: selectedDate.timeMax,
        });        
        const events = response.data.items;

        return events;
    }

    async getEventById(orgId: string, userId: string, eventId: string) {
        const tokenData = await this.oAuthService.getAccessToken(orgId, 'google', userId);
        if (!tokenData) {
            throw new NotFoundException('Access token missing');
        }
        const accessToken = tokenData.accessToken;

        this.oauth2Client = new google.auth.OAuth2();
        this.oauth2Client.setCredentials({
            access_token: accessToken,
        });

        const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });

        try {
            const calendarId = await this.getCalendarId(orgId);
            const response = await calendar.events.get({
                calendarId: calendarId,
                eventId: eventId,
            });
            return response.data;
        } catch (error) {
            if (error.code === 404) {
                throw new NotFoundException('Event not found');
            } else {
                console.error('Error getting event:', error);
                throw new Error('Failed to get event');
            }
        }
    }

    async addEventByAgent(agentId: string, createEventDto: CreateEventDto) {
        const agent = await this.prisma.agent.findUnique({ where: { id: agentId } });
        if (!agent) {
            throw new NotFoundException('agent not found');
        }
        const { orgId } = agent;
        const primaryUser = await this.getPrimaryUser(orgId);
        const userId = primaryUser.id;
        const result = await this.generateMeetingSummary(createEventDto.convoId);
        let jsonLead = undefined;
        if(result.content && result.content.includes('```json')) {
            jsonLead = extractJsonFromMarkdown(result.content);
        } else {
            jsonLead = JSON.parse(result.content);
        }
        if(jsonLead)
        {
            createEventDto.summary = jsonLead.summary;
            createEventDto.description = jsonLead.description;
        }
        return await this.addEvent(orgId, userId, createEventDto);
    }

    async addEvent(orgId: string, userId: string, createEventDto: CreateEventDto) {
        const timeMin = createEventDto.start.dateTime;
        const timeMax = createEventDto.end.dateTime;
        const day = this.daysOfWeek[new Date(timeMin).getDay()];
        const { availableDays } = await this.getAvailabilitySchedule(orgId);
        if (!availableDays.includes(day)) {
            throw new NotFoundException(`Slot not avaiable`);
        }
        const calendarId = await this.getCalendarId(orgId);
        const freeBusyData = await this.getFreeBusy(orgId, userId, {
            timeMin: timeMin,
            timeMax: timeMax,
            items: [{ id: calendarId }]
        });
        const busyTimes = freeBusyData.calendars[calendarId].busy;
        if (busyTimes.length > 0) {
            throw new NotAcceptableException('Slot not availbale');
        }
        const tokenData = await this.oAuthService.getAccessToken(orgId, 'google', userId);
        if (!tokenData) {
            throw new NotFoundException('Access token missing');
        }
        const accessToken = tokenData.accessToken;
        // Initialize OAuth2 client with the access token
        this.oauth2Client = new google.auth.OAuth2();
        this.oauth2Client.setCredentials({
            access_token: accessToken,
        });

        const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });
        const response = await calendar.events.insert({
            calendarId: calendarId,
            requestBody: createEventDto,
        });
        return response.data;
    }

    async updateEvent(orgId: string, userId: string, eventId: string, updateEventDto: UpdateEventDto) {
        const tokenData = await this.oAuthService.getAccessToken(orgId, 'google', userId);
        if (!tokenData) {
            throw new NotFoundException('Access token missing');
        }
        const accessToken = tokenData.accessToken;

        this.oauth2Client = new google.auth.OAuth2();
        this.oauth2Client.setCredentials({
            access_token: accessToken,
        });

        const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });

        try {
            const calendarId = await this.getCalendarId(orgId);
            const response = await calendar.events.update({
                calendarId: calendarId,
                eventId: eventId,
                requestBody: updateEventDto,
            });
            return response.data;
        } catch (error) {
            console.error('Error updating event:', error);
            throw new Error('Failed to update event');
        }
    }

    async removeEvent(orgId: string, userId: string, eventId: string) {
        const tokenData = await this.oAuthService.getAccessToken(orgId, 'google', userId);
        if (!tokenData) {
            throw new NotFoundException('Access token missing');
        }
        const accessToken = tokenData.accessToken;

        this.oauth2Client = new google.auth.OAuth2();
        this.oauth2Client.setCredentials({
            access_token: accessToken,
        });

        const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });

        try {
            const calendarId = await this.getCalendarId(orgId);
            await calendar.events.delete({
                calendarId: calendarId,
                eventId: eventId,
            });
            return { success: true, message: 'Event removed successfully' };
        } catch (error) {
            console.error('Error removing event:', error);
            throw new Error('Failed to remove event');
        }
    }

    async getFreeBusy(orgId: string, userId: string, freeBusyRequestDto: FreeBusyRequestDto) {
        // Retrieve access token
        const tokenData = await this.oAuthService.getAccessToken(orgId, 'google', userId);
        if (!tokenData) {
            throw new NotFoundException('Access token missing');
        }
        const accessToken = tokenData.accessToken;

        this.oauth2Client = new google.auth.OAuth2();
        this.oauth2Client.setCredentials({
            access_token: accessToken,
        });

        // Create Calendar API client
        const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });

        try {
            // Get free/busy information
            const response = await calendar.freebusy.query({
                requestBody: freeBusyRequestDto
            });
            return response.data;
        } catch (error) {
            console.error('Error getting free/busy information:', error);
            throw new Error('Failed to get free/busy information');
        }
    }

    async getAvailabilitySchedule(orgId: string): Promise<AvailabilitySchedule> {
        const schedule = await this.availabilityScheduleService.findByOrg(orgId);
        let availabilitySchedule: AvailabilitySchedule = {
            availableDays: schedule.availableDays.split(','),
            availableHours: schedule.availableHours,
            eventDuration: schedule.eventDuration
        };
        return availabilitySchedule;
    }

    async getAvailableDatesByAgent(agentId: string) {
        const agent = await this.prisma.agent.findUnique({ where: { id: agentId } });
        if (!agent) {
            throw new NotFoundException('agent not found');
        }
        const { orgId } = agent;
        const primaryUser = await this.getPrimaryUser(orgId);
        return await this.getAvailableDates(orgId, agentId);
    }

    async getAvailableDates(orgId: string, agentId: string) {
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

    async getAvailableSlotsByAgent(agentId: string, date: string) {
        const agent = await this.prisma.agent.findUnique({ where: { id: agentId } });
        if (!agent) {
            throw new NotFoundException('agent not found');
        }
        const { orgId } = agent;
        const primaryUser = await this.getPrimaryUser(orgId);
        return await this.getAvailableSlots(orgId, primaryUser.id, date);
    }

    async getAvailableSlots(orgId: string, userId: string, date: string) {
        const dateObject = this.validateDate(date);
        return await this.generateSlots(orgId, userId, await this.getAvailabilitySchedule(orgId), dateObject);
    }

    async generateSlots(orgId: string, userId: string, availabilitySchedule: AvailabilitySchedule, date: Date) {
        try {

            const { availableDays, availableHours, eventDuration } = availabilitySchedule;
            const slots: { start: Date; end: Date }[] = [];
            const dayIndex = new Date(date).getDay().toString();
            const day = this.daysOfWeek[dayIndex];
            if (!availableDays.includes(day)) return slots;
            const { timeMin, timeMax } = this.getStartEndTimesForDay(date);
            const calendarId = await this.getCalendarId(orgId);
            const freeBusyData = await this.getFreeBusy(orgId, userId, {
                timeMin: timeMin,
                timeMax: timeMax,
                items: [{ id: calendarId }]
            });
            const busyTimes = freeBusyData.calendars[calendarId].busy;
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
                            slots.push({ start: slotStart, end: slotEnd });
                        }
                        currentDate.setTime(currentDate.getTime() + eventDuration * 60000);
                    }
                });
            }
            return slots;
        }
        catch (error) {
            throw new BadRequestException(error);
        }
    }

    getStartEndTimesForDay(date: Date): { timeMin: string; timeMax: string } {
        const targetDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        const timeMin = new Date(targetDate.setUTCHours(0, 0, 0, 0)).toISOString();
        const timeMax = new Date(targetDate.setUTCHours(23, 59, 59, 999)).toISOString();

        return { timeMin, timeMax };
    }

    validateDate(dateString: string): Date {
        if (!dateString) {
            throw new BadRequestException('Invalid date');
        }
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(dateString)) {
            throw new BadRequestException('Invalid date format. Use YYYY-MM-DD format.');
        }

        const requestedDate = new Date(dateString);
        const currentDate = new Date();
        const today = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());

        if (requestedDate < today) {
            throw new BadRequestException('Invalid date. Date must be today or a future date.');
        }

        return requestedDate;
    }

    async getCalendarId(orgId: string): Promise<string> {
        const calendar = await this.availabilityScheduleService.findByOrg(orgId);
        return calendar.calendarId ? calendar.calendarId : this.calendarId;
    }

    async generateMeetingSummary(convId:string)
    {
        try
        {
            if(!convId){
                throw new Error('Convo ID missing');
            }
            const messages = await this.prisma.zautoMessage.findMany({where:{convId}});
            
            const _messages = messages.map(message =>{
                return {
                    role:message.role,
                    content:message.content,
                }
            });
            let prompt = SCHEDULE_SUMMERIZER_PROMPT_TEMPLATE;
            const _content = JSON.stringify(_messages)
            console.log(prompt);
            const promptMesssage = [
                {role: 'system', content: prompt},
                {role: 'user', content: _content}
            ];
            return await this.llmService.chat(promptMesssage);
            
        }
        catch(error)
        {
            console.log(error);
            return '';
        }
    }
}
