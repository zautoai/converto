import { Module } from '@nestjs/common';
import { IntentScoringService } from './intent-scoring.service';
import { IntentScoringController } from './intent-scoring.controller';

@Module({
  controllers: [IntentScoringController],
  providers: [IntentScoringService],
})
export class IntentScoringModule {}
