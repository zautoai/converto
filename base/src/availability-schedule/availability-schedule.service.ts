import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateScheduleDto } from './dto/create-schedule.dto';
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
        if (existingSchedule) {
            throw new ConflictException("This calendar already have an availability schedule");
        }
        const schedule = await prisma.availabilitySchedule.create({ data: scheduleData });
        await this.deleteAndCreateAvailableHours({ orgId, data: { scheduleId: schedule.id, availableHours: createScheduleDto.availableHours } });
        return schedule;
    }

    async findAll(orgId: string) {
        const prisma = await this.getPrismaClient(orgId)
        try {
            const allSchedules = await prisma.availabilitySchedule.findMany({
                include: { availableHours: true }
            });
            return allSchedules;
        }
        catch (error) {
            console.log(error);
            throw error;
        }
        finally {
            prisma.$disconnect()
            await this.closeConnection(orgId);
        }
    }

    async findOneByOrgId(orgId: string) {
        const prisma = await this.getPrismaClient(orgId)
        try {
            const allSchedules = await prisma.availabilitySchedule.findFirst({ include: { availableHours: true } });
            return allSchedules;
        }
        catch (error) {
            console.log(error);
            throw error;
        }
        finally {
            prisma.$disconnect()
            await this.closeConnection(orgId);
        }
    }

    async findOne(orgId: string, id: string) {
        const prisma = await this.getPrismaClient(orgId)
        try {
            const allSchedules = await prisma.availabilitySchedule.findFirst({ where: { id }, include: { availableHours: true } });
            return allSchedules;
        }
        catch (error) {
            console.log(error);
            throw error;
        }
        finally {
            prisma.$disconnect()
            await this.closeConnection(orgId);
        }
    }

    async update(serviceParams: ServiceParams<UpdateScheduleDto>) {
        const { orgId, id, data: updateScheduleDto } = serviceParams;
        const prisma = await this.getPrismaClient(orgId)
        try {
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
        }
        catch (error) {
            console.log(error);
            throw error;
        }
        finally {
            prisma.$disconnect()
            await this.closeConnection(orgId);
        }
    }

    async delete(serviceParams: ServiceParams<{ id: string }>) {
        const { orgId, data: { id } } = serviceParams
        const prisma = await this.getPrismaClient(orgId)
        try {
            const existingSchedule = await prisma.availabilitySchedule.findUnique({
                where: { id }
            });
            if (!existingSchedule) {
                throw new NotFoundException('Availability schedule not found');
            }
            await prisma.availabilitySchedule.delete({ where: { id } });
        }
        catch (error) {
            console.log(error);
            throw error;
        }
        finally {
            prisma.$disconnect()
            await this.closeConnection(orgId);
        }
    }

    async deleteAndCreateAvailableHours(serviceParams: ServiceParams<{ scheduleId: string, availableHours: any[] }>) {
        const { orgId, data: { scheduleId, availableHours } } = serviceParams;
        const prisma = await this.getPrismaClient(orgId)
        try {
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
        catch (error) {
            console.log(error);
            throw error;
        }
        finally {
            prisma.$disconnect()
            await this.closeConnection(orgId);
        }
    }

}
