import { Module } from '@nestjs/common';
import { IntentScoringService } from './intent-scoring.service';
import { IntentScoringController } from './intent-scoring.controller';
import { AssistantsModule } from 'src/assistants/assistants.module';
import { ProspectjourneyModule } from 'src/prospect-journey/prospect-journey.module';

@Module({
  imports:[
    AssistantsModule,
    ProspectjourneyModule,
  ],
  controllers: [IntentScoringController],
  providers: [IntentScoringService],
  exports:[IntentScoringService]
})
export class IntentScoringModule {}
