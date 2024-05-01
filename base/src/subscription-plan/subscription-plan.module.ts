import { Module } from '@nestjs/common';
import { SubscriptionPlanService } from './subscription-plan.service';
import { SubscriptionPlanController } from './subscription-plan.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports:[PrismaModule],
  controllers: [SubscriptionPlanController],
  providers: [SubscriptionPlanService],
  exports:[SubscriptionPlanService]
})
export class SubscriptionPlanModule {}
