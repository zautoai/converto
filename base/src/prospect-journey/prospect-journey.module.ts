import { Module } from '@nestjs/common';
import { ProspectjourneyService } from './prospect-journey.service';
import { ProspectjourneyController } from './prospect-journey.controller';
import { ProspectJourneySocketService } from './prospect-journey-socket/prospect-journey-socket.service';
import { ProspectJourneySocketGateway } from './prospect-journey-socket/prospect-journey-socket.gateway';
import { OrganizationsModule } from 'src/organizations/organizations.module';
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [
    OrganizationsModule,
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_IP,
        port: parseInt(process.env.REDIS_PORT, 10) || 6379,
        password: process.env.REDIS_PASSWORD,
      },
    }),
    BullModule.registerQueue({ name: 'intent_score_queue' }),
  ],
  controllers: [ProspectjourneyController],
  providers: [
    ProspectjourneyService, 
    ProspectJourneySocketService,
    ProspectJourneySocketGateway
  ],
  exports: [ProspectjourneyService]
})
export class ProspectjourneyModule {}
