import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { BaseService } from 'src/common/services/base.service';
import { ContactEnrichmentDto } from 'src/enrichment/dto/contact-enrich.dto';

@Injectable()
export class EnrichmentMicroService extends BaseService {
  constructor(
    @Inject('CRM_SERVICE') private readonly EnrichmentClient: ClientProxy,
  ) {
    super();
  }

  async enrichPeople(orgId: string, params: any) {
    try {
      console.log(orgId, params);

      return await this.EnrichmentClient.send(
        { cmd: 'ENRICH_PEOPLE' },
        { orgId, params },
      ).toPromise();
    } catch (error) {
      this.logger.error(`Error while creating contact: ${error.message}`);
      throw error;
    }
  }

  async enrichOrganization(orgId: string, params: any) {
    try {
      return await this.EnrichmentClient.send(
        { cmd: 'ENRICH_ORGANIZATION' },
        { orgId, params },
      ).toPromise();
    } catch (error) {
      this.logger.error(`Error while creating contact: ${error.message}`);
      throw error;
    }
  }

  async enrichContact(
    orgId: string,
    contactEnrichmentDto: ContactEnrichmentDto,
  ) {
    try {
      return await this.EnrichmentClient.send(
        { cmd: 'ENRICH_CONTACT' },
        { orgId, contactEnrichmentDto },
      ).toPromise();
    } catch (error) {
      this.logger.error(`Error while creating contact: ${error.message}`);
      throw error;
    }
  }
}
