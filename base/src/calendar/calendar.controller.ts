import { BadRequestException, Body, Controller, Delete, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { CalendarService } from './calendar.service';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ZautoRequest } from 'src/common/models/request.model';
import { CalendarAuthDto } from './dto/calendar.dto';
import { CallBackDto } from './dto/callbac.dto';
import { BookEventDto } from './dto/book-event.dto';

@ApiTags('Calendar')
@Controller('api/calendar')
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getCalendars(@Query() crmAuthDto:CalendarAuthDto,@Req() request: ZautoRequest) {
    const orgId = request.orgId;
    return this.calendarService.getCalendars(orgId);
  }

  @Get('auth-url')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getAuthUrl(@Query() crmAuthDto:CalendarAuthDto,@Req() request: ZautoRequest) {
    const orgId = request.orgId;
    const state = crmAuthDto.name;
    return this.calendarService.getAuthUrl(orgId,crmAuthDto.name,{state});
  }
  
  @Get('callback')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async callback(@Query() callBackDto:CallBackDto,@Req() request: ZautoRequest) {
    const orgId = request.orgId;
    return await this.calendarService.exchangeCodeForAccessToken(orgId,callBackDto.state,callBackDto.code);
  }

  @Get('access-token')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getAccessToken(@Query() crmAuthDto:CalendarAuthDto, @Req() request: ZautoRequest) {
    const orgId = request.orgId;
    return await this.calendarService.getAccessToken(orgId, crmAuthDto.name);
  }

  @Delete('revoke/:calendar_name')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async revokeAccess(@Param('calendar_name') calendarName: string, @Req() request: ZautoRequest)
  {
    const orgId = request.orgId;
    return await this.calendarService.revokeAccess(orgId, calendarName);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getProfile(@Query() crmAuthDto:CalendarAuthDto, @Req() request: ZautoRequest) {
    const orgId = request.orgId;
    return await this.calendarService.getProfile(orgId, crmAuthDto.name);
  }

  @Get('/available-dates/:agentId')
  async getAvailableDates(@Param('agentId') agentId: string)
  {
      return await this.calendarService.getAvailableDatesByAgent(agentId);
  }

  @Get('/available-slots/:agentId')
  @ApiQuery({name:'date'})
  async getAvailableSlots(@Param('agentId') agentId: string,@Query() queryParams:{date:string})
  {
      const { date } = queryParams;
      if(!date)
      {
          throw new BadRequestException('Date not provided.');
      }
      return await this.calendarService.getAvailableSlotsByAgent(agentId, date);
  }

  @Post('book-event/:agentId')
  async bookEvents(@Param('agentId') agentId: string,@Body() bookEventDto: BookEventDto)
  {
      return await this.calendarService.bookEventByAgent(agentId, bookEventDto);
  }
  
  @Get('events/:date')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async getEvents(@Param('date') date:string,@Req() request: ZautoRequest)
  {
      const orgId = request.orgId;
      return await this.calendarService.getEvents(orgId,date)
  }

  @Get('slots/:date')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async getSlots(@Param('date') date:string,@Req() request: ZautoRequest)
  {
      const orgId = request.orgId;
      return await this.calendarService.getSlots(orgId,date)
  }
}
