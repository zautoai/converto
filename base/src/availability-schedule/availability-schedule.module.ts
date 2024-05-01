import { Module } from '@nestjs/common';
import { AvailabilityScheduleService } from './availability-schedule.service';
import { AvailabilityScheduleController } from './availability-schedule.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [AvailabilityScheduleService],
  controllers: [AvailabilityScheduleController],
  exports: [AvailabilityScheduleService]
})
export class AvailabilityScheduleModule {}
