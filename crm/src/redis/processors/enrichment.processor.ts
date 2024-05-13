import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { EnrichmentService } from '../../enrichment/enrichment.service';

@Processor('enrichment_queue')
export class EnrichmentProcessor {
  private readonly logger = new Logger(EnrichmentProcessor.name);

  constructor(private readonly enrichmentService: EnrichmentService) {}

  @Process('Apollo')
  async handleApollo(job: any) {
    this.logger.log('Processing Apollo enrichment');
    const { orgId, contactId, provider, matchRequest } = job.data;
    await this.enrichmentService.enrichPeopleByContact(
      orgId,
      contactId,
      matchRequest,
      provider,
    );
  }
}
