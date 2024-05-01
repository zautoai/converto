import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { UpdateScheduleDto } from './dto/update-schedule.dto';

@Injectable()
export class AvailabilityScheduleService {

    constructor(
        private readonly prisma: PrismaService
    ) { }

    async create(createScheduleDto: CreateScheduleDto) {
        const scheduleData = {
            orgId: createScheduleDto.orgId,
            availableDays: createScheduleDto.availableDays,
            eventDuration: createScheduleDto.eventDuration,
            calendarId: createScheduleDto.calendarId
        }
        try {
            const schedule = await this.prisma.availabilitySchedule.create({ data: scheduleData });
            await this.deleteAndCreateAvailableHours(createScheduleDto.orgId,schedule.id,createScheduleDto.availableHours);
            return schedule;
        }
        catch (error) {
            if (error instanceof PrismaClientKnownRequestError && error.code == 'P2002') {
                throw new ConflictException("This Availability schedule already exist for this org");
            }
            else {
                throw new BadRequestException(error);
            }
        }
    }

    async findAll() {
        try {
            const allSchedules = await this.prisma.availabilitySchedule.findMany();
            return allSchedules;
        } catch (error) {
            throw new BadRequestException(error);
        }
    }

    async findByOrg(orgId: string) {
        const existingSchedule = await this.prisma.availabilitySchedule.findFirst({
            where: {
                orgId
            },
            include: {
                availableHours: true
            }
        });
        if (!existingSchedule) {
            throw new NotFoundException('Availability schedule not found');
        }
        return existingSchedule;
    }

    async update(id: string, updateScheduleDto: UpdateScheduleDto) {
        try {
            const existingSchedule = await this.prisma.availabilitySchedule.findUnique({
                where: { id }
            });
            if (!existingSchedule) {
                throw new NotFoundException('Availability schedule not found');
            }
            await this.deleteAndCreateAvailableHours(updateScheduleDto.orgId,existingSchedule.id,updateScheduleDto.availableHours);
            const scheduleData = {
                orgId: updateScheduleDto.orgId,
                availableDays: updateScheduleDto.availableDays,
                eventDuration: updateScheduleDto.eventDuration,
                calendarId: updateScheduleDto.calendarId
            }
            const updatedSchedule = await this.prisma.availabilitySchedule.update({
                where: { id },
                data: scheduleData
            });
            return updatedSchedule;
        } catch (error) {
            throw new BadRequestException(error);
        }
    }

    async delete(id: string) {
        try {
            const existingSchedule = await this.prisma.availabilitySchedule.findUnique({
                where: { id }
            });
            if (!existingSchedule) {
                throw new NotFoundException('Availability schedule not found');
            }
            await this.prisma.availabilitySchedule.delete({ where: { id } });
        } catch (error) {
            throw new BadRequestException(error);
        }
    }

    async deleteAndCreateAvailableHours(orgId: string, scheduleId: string, availableHours: any[]) {
        await this.prisma.availableHours.deleteMany({
            where: {
                orgId: orgId,
                scheduleId: scheduleId
            }
        });
        for (let availableHour of availableHours) {
            const availableHourData = {
                ...availableHour,
                ...{
                    orgId: orgId,
                    scheduleId: scheduleId
                }
            }
            await this.prisma.availableHours.create({ data: availableHourData })
        }
    }

}
