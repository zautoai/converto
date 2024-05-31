import { Process, Processor } from "@nestjs/bull";
import { Injectable, Logger } from "@nestjs/common";
import { Job } from "bullmq";
import { IntentScoringService } from "src/intent-scoring/intent-scoring.service";

@Processor('intent_score_queue')
@Injectable()
export class IntentScoreProcessor {

    private readonly logger = new Logger(IntentScoreProcessor.name);

    constructor(private readonly intentScoringService:IntentScoringService) {}

    @Process('intent_score')
    async processTask(job: Job<any>): Promise<void> {
        const taskData = job.data;
        try
        {
            this.logger.log(`Processing task started: ${JSON.stringify(taskData)}`);
            this.logger.log(taskData)
            await this.intentScoringService.generateIntentScore(taskData.orgId,taskData.visitId);            
            this.logger.log(`Processing task completed: ${JSON.stringify(taskData)}`);
        }
        catch(error)
        {
            this.logger.error(error)
        }
    }
}
