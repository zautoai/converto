import { BadRequestException, Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { GoogleCalendarService } from './google-calendar.service';
import { ZautoRequest } from 'src/common/models/request.model';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { DateFilterDto } from './dto/date-filter.dto';

@ApiTags('Google calendar')
@Controller('api/google-calendar')
export class GoogleCalendarController {

    constructor(
        private readonly googleCalendarService:  GoogleCalendarService
    ){}

    @Get()
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    async getCalendar(@Req() request: ZautoRequest)
    {
        if(request.user && request.orgId)
        {
            const userId = request.user.id;
            const orgId = request.orgId;
            return await this.googleCalendarService.getCalendar(orgId,userId);
        }
        else
        {
            throw new UnauthorizedException("Unauthorised access.")
        }
    }

    @Post('/events')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    async addEvents(@Body() createEventDto: CreateEventDto,@Req() request: ZautoRequest)
    {
        if(request.user && request.orgId)
        {
            const orgId = request.orgId;
            const primaryUser = await this.googleCalendarService.getPrimaryUser(orgId);
            const userId = primaryUser.id;
            
            return await this.googleCalendarService.addEvent(orgId,userId,createEventDto);
        }
        else
        {
            throw new UnauthorizedException("Unauthorised access.")
        }
    }

    @Get('/events')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    async getEvents(@Query() dateFilterDto:DateFilterDto,@Req() request: ZautoRequest)
    {
        if(request.user && request.orgId)
        {
            const orgId = request.orgId;
            const primaryUser = await this.googleCalendarService.getPrimaryUser(orgId);
            const userId = primaryUser.id;
            return await this.googleCalendarService.getEvents(orgId,userId,dateFilterDto.date);
        }
        else
        {
            throw new UnauthorizedException("Unauthorised access.")
        }
    }

    @Get('/events/:eventId')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    async getEvent(@Param('eventId') eventId: string, @Req() request: ZautoRequest)
    {
        if(request.user && request.orgId)
        {
            const orgId = request.orgId;
            const primaryUser = await this.googleCalendarService.getPrimaryUser(orgId);
            const userId = primaryUser.id;
            return await this.googleCalendarService.getEventById(orgId,userId,eventId);
        }
        else
        {
            throw new UnauthorizedException("Unauthorised access.")
        }
    }

    @Patch('/events/:eventId')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    async updateEvents(@Param('eventId') eventId: string, @Body() updateEventDto: UpdateEventDto,@Req() request: ZautoRequest)
    {
        if(request.user && request.orgId)
        {
            const orgId = request.orgId;
            const primaryUser = await this.googleCalendarService.getPrimaryUser(orgId);
            const userId = primaryUser.id;
            return await this.googleCalendarService.updateEvent(orgId,userId,eventId,updateEventDto);
        }
        else
        {
            throw new UnauthorizedException("Unauthorised access.")
        }
    }

    @Delete('/events/:eventId')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    async removeEvents(@Param('eventId') eventId: string,@Req() request: ZautoRequest)
    {
        if(request.user && request.orgId)
        {
            const orgId = request.orgId;
            const primaryUser = await this.googleCalendarService.getPrimaryUser(orgId);
            const userId = primaryUser.id;
            return await this.googleCalendarService.removeEvent(orgId,userId,eventId);
        }
        else
        {
            throw new UnauthorizedException("Unauthorised access.")
        }
    }

    // @Get('/available-dates/:agentId')
    // async getAvailableDates(@Param('agentId') agentId: string)
    // {
    //     return this.googleCalendarService.getAvailableDatesByAgent(agentId);
    // }
    
    // @Get('/available-slots/:agentId')
    // @ApiQuery({name:'date'})
    // async getAvailableSlots(@Param('agentId') agentId: string,@Query() queryParams:{date:string})
    // {
    //     const { date } = queryParams;
    //     if(!date)
    //     {
    //         throw new BadRequestException('Date not provided.');
    //     }
    //     return this.googleCalendarService.getAvailableSlotsByAgent(agentId,date);

    // }

    // @Post('book-event/:agentId')
    // async bookEvents(@Param('agentId') agentId: string,@Body() createEventDto: CreateEventDto)
    // {
    //     return await this.googleCalendarService.addEventByAgent(agentId,createEventDto);

    // }
}
