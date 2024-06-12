import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { AvailabilityScheduleService } from './availability-schedule.service';
import { ZautoRequest } from 'src/common/models/request.model';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';

@ApiTags('Availability schedule')
@Controller('api/availability-schedule')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class AvailabilityScheduleController {


    constructor(
        private readonly scheduleService: AvailabilityScheduleService,
    ) { }

    @Post()
    async create(@Body() createScheduleDto: CreateScheduleDto, @Req() request: ZautoRequest) {
        if (request.user && request.user.orgId) {
            const orgId = request.user.orgId;
            return await this.scheduleService.create({ orgId, data: createScheduleDto });
        }
        else {
            throw new UnauthorizedException("Unauthorised access.")
        }
    }

    @Get()
    async findOne(@Req() request: ZautoRequest) {
        if (request.user && request.user.orgId) {
            const orgId = request.user.orgId;
            return await this.scheduleService.findAll(orgId);
        }
        else {
            throw new UnauthorizedException("Unauthorised access.")
        }
    }

    @Get(':scheduleId')
    async findOneById(@Param('scheduleId') scheduleId: string, @Req() request: ZautoRequest) {
        if (request.user && request.user.orgId) {
            const orgId = request.user.orgId;
            return await this.scheduleService.findOne(orgId,scheduleId);
        }
        else {
            throw new UnauthorizedException("Unauthorised access.")
        }
    }

    @Patch(':scheduleId')
    async update(@Param('scheduleId') scheduleId: string, @Body() updateScheduleDto: UpdateScheduleDto, @Req() request: ZautoRequest) {
        if (request.user && request.user.orgId) {
            const orgId = request.user.orgId;
            return await this.scheduleService.update({ orgId, id: scheduleId, data: updateScheduleDto });
        }
        else {
            throw new UnauthorizedException("Unauthorised access.")
        }
    }


    @Delete(':scheduleId')
    async delete(@Query('scheduleId') scheduleId: string, @Req() request: ZautoRequest) {
        if (request.user && request.user.orgId) {
            const orgId = request.user.orgId;
            return await this.scheduleService.delete({ orgId, data: { id: scheduleId } });
        }
        else {
            throw new UnauthorizedException("Unauthorised access.")
        }
    }
}
