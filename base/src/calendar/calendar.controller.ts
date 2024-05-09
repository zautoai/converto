import { BadRequestException, Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { CalendarService } from './calendar.service';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CreateEventDto } from 'src/google-calendar/dto/create-event.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { DateFilterDto } from 'src/google-calendar/dto/date-filter.dto';
import { ZautoRequest } from 'src/common/models/request.model';
import { CalendarAuthDto } from './dto/calendar.dto';
import { CallBackDto } from './dto/callbac.dto';

@ApiTags('Calendar')
@Controller('api/calendar')
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Get('auth-url')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getAuthUrl(@Query() crmAuthDto:CalendarAuthDto,@Req() request: ZautoRequest) {
    const orgId = request.user.org.id;
    return this.calendarService.getAuthUrl(orgId,crmAuthDto.name,{});
  }
  
  @Get('callback')
  // @UseGuards(JwtAuthGuard)
  // @ApiBearerAuth()
  async callback(@Query() callBackDto:CallBackDto,@Req() request: ZautoRequest) {
    const orgId = request.user.org.id;
    return await this.calendarService.exchangeCodeForAccessToken(orgId,callBackDto.state,callBackDto.code);
  }

  @Get('access-token')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getAccessToken(@Query() crmAuthDto:CalendarAuthDto, @Req() request: ZautoRequest) {
    const orgId = request.user.org.id;
    return await this.calendarService.getAccessToken(orgId, crmAuthDto.name);
  }

  @Get('revoke-access')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async revokeAccess(@Query() crmAuthDto:CalendarAuthDto, @Req() request: ZautoRequest)
  {
    const orgId = request.user.org.id;
    return await this.calendarService.revokeAccess(orgId, crmAuthDto.name);
  }

  @Get('/available-dates/:agentId')
  async getAvailableDates(@Param('agentId') agentId: string)
  {
      
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

  }

  @Post('book-event/:agentId')
  async bookEvents(@Param('agentId') agentId: string,@Body() createEventDto: CreateEventDto)
  {

  }
  
  @Get('events/')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async getEvents(@Query() dateFilterDto:DateFilterDto,@Req() request: ZautoRequest)
  {

  }
}
