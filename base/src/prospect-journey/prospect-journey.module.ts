import { Module } from '@nestjs/common';
import { ProspectjourneyService } from './prospect-journey.service';
import { ProspectjourneyController } from './prospect-journey.controller';

@Module({
  controllers: [ProspectjourneyController],
  providers: [ProspectjourneyService],
})
export class ProspectjourneyModule {}
