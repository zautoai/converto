import { Module } from '@nestjs/common';
import { AccountBasedMaretingService } from './account-based-mareting.service';
import { AccountBasedMaretingController } from './account-based-mareting.controller';
import { MicroservicesModule } from 'src/microservices/microservices.module';

@Module({
  imports:[
    MicroservicesModule
  ],
  controllers: [AccountBasedMaretingController],
  providers: [AccountBasedMaretingService],
})
export class AccountBasedMaretingModule {}
