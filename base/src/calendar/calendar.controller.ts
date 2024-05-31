import { BadRequestException, Body, Controller, Delete, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { CalendarService } from './calendar.service';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ZautoRequest } from 'src/common/models/request.model';
import { CalendarAuthDto } from './dto/calendar.dto';
import { CallBackDto } from './dto/callbac.dto';
import { BookEventDto } from './dto/book-event.dto';
import { SubdomainGuard } from 'src/common/guard/subdomain/subdomain.guard';
import { SubdomainRequest } from 'src/common/models/subdomain-request.model';

@ApiTags('Calendar')
@Controller('api/calendar')
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) { }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getCalendars(@Query() crmAuthDto: CalendarAuthDto, @Req() request: ZautoRequest) {
    const orgId = request.user.orgId;
    return this.calendarService.getCalendars(orgId);
  }

  @Get('auth-url')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getAuthUrl(@Query() crmAuthDto: CalendarAuthDto, @Req() request: ZautoRequest) {
    const orgId = request.user.orgId;
    const state = crmAuthDto.name;
    return this.calendarService.getAuthUrl({ orgId, data: { calendarName: crmAuthDto.name, additionalInfo: state } });
  }

  @Get('callback')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async callback(@Query() callBackDto: CallBackDto, @Req() request: ZautoRequest) {
    const orgId = request.user.orgId;
    return await this.calendarService.exchangeCodeForAccessToken({ orgId, data: { calendarName: callBackDto.state, code: callBackDto.code } });
  }

  @Get('access-token')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getAccessToken(@Query() crmAuthDto: CalendarAuthDto, @Req() request: ZautoRequest) {
    const orgId = request.user.orgId;
    return await this.calendarService.getAccessToken({ orgId, data: { calendarName: crmAuthDto.name } });
  }

  @Delete('revoke/:calendar_name')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async revokeAccess(@Param('calendar_name') calendarName: string, @Req() request: ZautoRequest) {
    const orgId = request.user.orgId;
    return await this.calendarService.revokeAccess({ orgId, data: { calendarName } });
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getProfile(@Query() crmAuthDto: CalendarAuthDto, @Req() request: ZautoRequest) {
    const orgId = request.user.orgId;
    return await this.calendarService.getProfile({ orgId, data: { calendarName: crmAuthDto.name } });
  }

  @Get('/available-dates')
  @UseGuards(SubdomainGuard)
  async getAvailableDates(@Req() request:SubdomainRequest) {
    const orgId = request.orgId;
    return await this.calendarService.getAvailableDates(orgId);
  }

  @Get('/available-slots')
  @ApiQuery({ name: 'date' })
  async getAvailableSlots(@Query() queryParams: { date: string },@Req() request:SubdomainRequest) {
    const { date } = queryParams;
    const orgId = request.orgId;
    if (!date) {
      throw new BadRequestException('Date not provided.');
    }
    return await this.calendarService.getSlots({ orgId, data: { _date: date } });
  }

  @Post('book-event')
  async bookEvents(@Body() bookEventDto: BookEventDto,@Req() request:SubdomainRequest) {
    const orgId = request.orgId;
    return await this.calendarService.addEvent({ orgId, data: { event: bookEventDto } });
  }

  @Get('events/:date')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async getEvents(@Param('date') date: string, @Req() request: ZautoRequest) {
    const orgId = request.user.orgId;
    return await this.calendarService.getEvents({ orgId, data: { date } })
  }

  @Get('slots/:date')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async getSlots(@Param('date') date: string, @Req() request: ZautoRequest) {
    const orgId = request.user.orgId;
    return await this.calendarService.getSlots({ orgId, data: { _date: date } })
  }
}
