import { BadRequestException, Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiProperty, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { GoogleCalendarService } from './google-calendar.service';
import { ZautoRequest } from 'src/common/models/request.model';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { DateFilterDto } from './dto/date-filter.dto';

@ApiTags('calendar')
@Controller('api/calendar')
export class CalendarController {

    // constructor(
    //     private readonly googleCalendarService:  GoogleCalendarService
    // ){}


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
    
    // @Get('events/')
    // @ApiBearerAuth()
    // @UseGuards(JwtAuthGuard)
    // async getEvents(@Query() dateFilterDto:DateFilterDto,@Req() request: ZautoRequest)
    // {
    //     if(request.user && request.user.org)
    //     {
    //         const orgId = request.user.org.id;
    //         const primaryUser = await this.googleCalendarService.getPrimaryUser(orgId);
    //         const userId = primaryUser.id;
    //         return await this.googleCalendarService.getEvents(orgId,userId,dateFilterDto.date);
    //     }
    //     else
    //     {
    //         throw new UnauthorizedException("Unauthorised access.")
    //     }
    // }
}
