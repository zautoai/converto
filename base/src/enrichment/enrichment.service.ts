import { Injectable } from '@nestjs/common';
import { BaseService } from 'src/common/services/base.service';
import { ContactEnrichmentDto } from './dto/contact-enrich.dto';
import { EnrichmentMicroService } from 'src/microservices/crm_service/enrichment.service';

@Injectable()
export class EnrichmentService extends BaseService {
  constructor(private readonly enrichmentMicroService: EnrichmentMicroService) {
    super();
  }

  async enrichPeople(orgId: string, params: any) {
    return this.handleException(
      await this.enrichmentMicroService.enrichPeople(orgId, params),
    );
  }
  async enrichOrganization(orgId: string, params: any) {
    return this.handleException(
      await this.enrichmentMicroService.enrichOrganization(orgId, params),
    );
  }
  async enrichContact(
    orgId: string,
    contactEnrichmentDto: ContactEnrichmentDto,
  ) {
    return this.handleException(
      await this.enrichmentMicroService.enrichContact(
        orgId,
        contactEnrichmentDto,
      ),
    );
  }
}
