import { Module } from '@nestjs/common';
import { AccountBasedMaretingService } from './account-based-mareting.service';
import { AccountBasedMaretingController } from './account-based-mareting.controller';

@Module({
  controllers: [AccountBasedMaretingController],
  providers: [AccountBasedMaretingService],
})
export class AccountBasedMaretingModule {}
