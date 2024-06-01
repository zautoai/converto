import { Process, Processor } from "@nestjs/bull";
import { Injectable, Logger } from "@nestjs/common";
import { Job } from "bullmq";
import { IcpService } from "src/icp/icp.service";


@Processor('icp_score_queue')
@Injectable()
export class IcpScoreProcessor {

    private readonly logger = new Logger(IcpScoreProcessor.name);

    constructor(private readonly icpService: IcpService) { }

    @Process('icp_score')
    async processTask(job: Job<any>): Promise<void> {
        const taskData = job.data;
        try {
            this.logger.log(`Processing task started: ${JSON.stringify(taskData)}`);
            const result = await this.icpService.calculateIcpScore(taskData.orgId, taskData.contact);
            console.log(result);
            this.logger.log(`Processing task completed: ${JSON.stringify(taskData)}`);
        }
        catch (error) {
            this.logger.error(error)
        }
    }

}