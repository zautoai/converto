import { Module } from '@nestjs/common';
import { ProspectjourneyService } from './prospect-journey.service';
import { ProspectjourneyController } from './prospect-journey.controller';
import { ProspectJourneySocketService } from './prospect-journey-socket/prospect-journey-socket.service';
import { ProspectJourneySocketGateway } from './prospect-journey-socket/prospect-journey-socket.gateway';
import { OrganizationsModule } from 'src/organizations/organizations.module';

@Module({
  imports: [
    OrganizationsModule
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
