import {
  BadRequestException,
  Controller,
  UnauthorizedException,
} from '@nestjs/common';
import { EnrichmentService } from './enrichment.service';
import { MessagePattern } from '@nestjs/microservices';
import { EnrichmentProviderName } from './enrichment-provider.enum';

@Controller()
export class EnrichmentMicroserviceController {
  constructor(private readonly enrichmentService: EnrichmentService) {}

  @MessagePattern({ cmd: 'ENRICH_PEOPLE' })
  async enrichPeople(data: any) {
    console.log('started');
    try {
      let {
        firstName,
        lastName,
        email,
        phoneNumber,
        domain,
        provider,
        linkedin_url,
      } = data.params;
      console.log(data.params);

      provider = provider ? provider : EnrichmentProviderName.APOLLO;
      if (firstName || lastName) {
        return await this.enrichmentService.getPeopleByName(
          firstName,
          lastName,
          provider,
        );
      } else if (email) {
        return await this.enrichmentService.getPeopleByEmail(email, provider);
      } else if (phoneNumber) {
        return await this.enrichmentService.getPeopleByPhone(
          phoneNumber,
          provider,
        );
      } else if (domain) {
        return await this.enrichmentService.getPeopleByDomain(domain, provider);
      } else if (linkedin_url) {
        return await this.enrichmentService.getPeople(
          { linkedin_url: linkedin_url },
          provider,
        );
      } else {
        throw new BadRequestException('Invalid query parameters');
      }
    } catch (error) {
      return error.response || error;
    }
  }

  @MessagePattern({ cmd: 'ENRICH_ORGANIZATION' })
  async enrichOrganization(data: any) {
    try {
      let { domain, provider } = data.params;
      provider = provider ? provider : EnrichmentProviderName.APOLLO;
      if (domain) {
        return await this.enrichmentService.getOrganizationByDomain(
          domain,
          provider,
        );
      } else {
        throw new BadRequestException('Invalid query parameters');
      }
    } catch (error) {
      return error.response || error;
    }
  }

  @MessagePattern({ cmd: 'ENRICH_CONTACT' })
  async enrichContact(data: any) {
    try {
      let { orgId, contactEnrichmentDto } = data;
      if (orgId) {
        const provided = contactEnrichmentDto.provider
          ? contactEnrichmentDto.provider
          : EnrichmentProviderName.APOLLO;
        return await this.enrichmentService.enrichContact(
          orgId,
          contactEnrichmentDto.contactId,
          provided,
        );
      }
      throw new UnauthorizedException();
    } catch (error) {
      return error.response || error;
    }
  }
}
