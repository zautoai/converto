import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateScheduleDto, availableHour } from './dto/create-schedule.dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { BaseService } from 'src/common/services/base.service';
import { ServiceParams } from 'src/common/models/service-param.model';

@Injectable()
export class AvailabilityScheduleService extends BaseService {

    constructor() {
        super()
    }

    async create(serviceParams: ServiceParams<CreateScheduleDto>) {
        const { orgId, data: createScheduleDto } = serviceParams
        const scheduleData = {
            availableDays: createScheduleDto.availableDays,
            eventDuration: createScheduleDto.eventDuration,
            calendarId: createScheduleDto.calendarId
        }
        const prisma = await this.getPrismaClient(orgId)
        const existingSchedule = await prisma.availabilitySchedule.findFirst();
        if(existingSchedule)
        {
            throw new ConflictException("This calendar already have an availability schedule");
        }
        const schedule = await prisma.availabilitySchedule.create({ data: scheduleData });
        await this.deleteAndCreateAvailableHours({ orgId, data: { scheduleId: schedule.id, availableHours: createScheduleDto.availableHours } });
        return schedule;
    }

    async findAll(orgId: string) {
        try {
            const prisma = await this.getPrismaClient(orgId)
            const allSchedules = await prisma.availabilitySchedule.findMany({
                include: { availableHours: true }
            });
            return allSchedules;
        } catch (error) {
            throw new BadRequestException(error);
        }
    }

    async findOne(orgId: string,id:string) {
        try {
            const prisma = await this.getPrismaClient(orgId)
            const allSchedules = await prisma.availabilitySchedule.findFirst({ where:{id},include: { availableHours: true } });
            return allSchedules;
        } catch (error) {
            throw new BadRequestException(error);
        }
    }

    async update(serviceParams: ServiceParams<UpdateScheduleDto>) {
        const { orgId, id, data: updateScheduleDto } = serviceParams;
        try {
            const prisma = await this.getPrismaClient(orgId)
            const existingSchedule = await prisma.availabilitySchedule.findUnique({
                where: { id }
            });
            if (!existingSchedule) {
                throw new NotFoundException('Availability schedule not found');
            }
            await this.deleteAndCreateAvailableHours({ orgId, data: { scheduleId: existingSchedule.id, availableHours: updateScheduleDto.availableHours } });
            const scheduleData = {
                availableDays: updateScheduleDto.availableDays,
                eventDuration: updateScheduleDto.eventDuration,
                calendarId: updateScheduleDto.calendarId
            }
            const updatedSchedule = await prisma.availabilitySchedule.update({
                where: { id },
                data: scheduleData
            });
            return updatedSchedule;
        } catch (error) {
            throw new BadRequestException(error);
        }
    }

    async delete(serviceParams: ServiceParams<{ id: string }>) {
        const { orgId, data: { id } } = serviceParams
        try {
            const prisma = await this.getPrismaClient(orgId)
            const existingSchedule = await prisma.availabilitySchedule.findUnique({
                where: { id }
            });
            if (!existingSchedule) {
                throw new NotFoundException('Availability schedule not found');
            }
            await prisma.availabilitySchedule.delete({ where: { id } });
        } catch (error) {
            throw new BadRequestException(error);
        }
    }

    async deleteAndCreateAvailableHours(serviceParams: ServiceParams<{ scheduleId: string, availableHours: any[] }>) {
        const { orgId, data: { scheduleId, availableHours } } = serviceParams;
        const prisma = await this.getPrismaClient(orgId)
        await prisma.availableHours.deleteMany({
            where: {
                scheduleId: scheduleId
            }
        });
        for (let availableHour of availableHours) {
            const availableHourData = {
                ...availableHour,
                ...{
                    scheduleId: scheduleId
                }
            }
            await prisma.availableHours.create({ data: availableHourData })
        }
    }

}
