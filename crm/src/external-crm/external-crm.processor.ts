import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { ExternalCrmService } from './external-crm.service';

@Processor('crm_queue')
export class ExternalCrmProcessor {
  private readonly logger = new Logger(ExternalCrmProcessor.name);

  constructor(
    private readonly externalCrmService: ExternalCrmService
  ) {}

  @Process('CreateContact')
  async handleCreateContact(job: any) {
    this.logger.log(`CreateContact job started`);
    const { orgId, crmName, data } = job.data;
    await this.externalCrmService.createContact(orgId, crmName,data);    
  }
}
