import { BadRequestException, Injectable } from '@nestjs/common';
import { IEnrichment } from '../interfaces/enrichment.interface';
import { WebClientService } from 'src/common/services/web-client.service';
import { buildQueryString } from 'src/common/utils/cast.helper';

@Injectable()
export class ApolloService implements IEnrichment {
  private isSandbox: boolean = false;
  api_key: string;

  constructor(private readonly webClient: WebClientService) {
    this.api_key = process.env.APOLLO_API_KEY;
  }

  async getPeople(matchRequest: { [key: string]: string }): Promise<IContact> {
    try {
      matchRequest['api_key'] = this.api_key;
      if (this.isApiKeyMissing(matchRequest)) {
        throw new BadRequestException('API key is missing.');
      }
      const queryString = buildQueryString(matchRequest);
      const endPoint = this.isSandbox
        ? 'http://localhost:8080/apollo'
        : 'https://api.apollo.io/v1/people/match';
      const url = `https://api.apollo.io/v1/people/match?${queryString}`;
      const response = await this.webClient.get(url);
      return this.handlePersonResponse(response);
    } catch (error) {
      console.error(error);
      throw new BadRequestException(
        error.message || 'Something went wrong. Please try again later.',
      );
    }
  }

  async getOrganization(matchRequest: {
    [key: string]: string;
  }): Promise<IOrganization> {
    try {
      matchRequest['api_key'] = this.api_key;
      if (this.isApiKeyMissing(matchRequest)) {
        throw new BadRequestException('API key is missing.');
      }
      const queryString = buildQueryString(matchRequest);
      const url = `https://api.apollo.io/v1/organizations/enrich?${queryString}`;
      const response = await this.webClient.get(url);
      return this.handleOrganizationResponse(response);
    } catch (error) {
      console.error(error);
      throw new BadRequestException(
        error.message || 'Something went wrong. Please try again later.',
      );
    }
  }

  isApiKeyMissing(matchRequest: { [key: string]: string }): boolean {
    return !matchRequest.hasOwnProperty('api_key') || !matchRequest['api_key'];
  }

  handlePersonResponse(response: any): IContact {
    const contact = response.person;
    if (!contact) {
      return null;
    }
    const phoneNumber =
      contact.phone_numbers && contact.phone_numbers.length > 0
        ? contact?.phone_numbers[0].sanitized_number || null
        : null;
    return {
      photoUrl: contact?.photo_url || null,
      firstName: contact?.first_name || null,
      lastName: contact?.last_name || null,
      email: contact?.email || null,
      phone: phoneNumber || null,
      jobTitle: contact?.title || null,
      organizationName: contact.organization?.name || null,
      organization: {
        logoUrl: contact.organization?.logo_url || null,
        name: contact.organization?.name || null,
        website: contact?.organization?.website_url || null,
        phone: contact?.organization?.sanitized_phone || null,
        domain: contact?.organization?.primary_domain || null,
        address:
          contact?.organization?.raw_address ||
          contact.organization?.street_address ||
          null,
        city: contact?.organization?.city || null,
        state: contact?.organization?.state || null,
        zip: contact?.organization?.postal_code || null,
        country: contact?.organization?.country || null,
        description:
          contact?.organization?.short_description ||
          contact.organization?.seo_description ||
          null,
        size: contact?.organization?.estimated_num_employees || null,
        industry: contact?.organization?.industry || null,
        foundedYear: contact?.organization?.founded_year || null,
        socialMedia: {
          linkedin: contact?.organization?.linkedin_url || null,
          facebook: contact?.organization?.facebook_url || null,
          twitter: contact?.organization?.twitter_url || null,
          instagram: contact?.organization?.instagram_url || null,
        },
      },
      address: contact?.address || null,
      city: contact?.city || null,
      state: contact?.state || null,
      zip: contact?.postal_code || null,
      country: contact?.country || null,
      socialMedia: {
        linkedin: contact?.linkedin_url || null,
        facebook: contact?.facebook_url || null,
        twitter: contact?.twitter_url || null,
        instagram: contact?.instagram_url || null,
      },
    };
  }

  handleOrganizationResponse(response: any): IOrganization {
    const contact = response.organization;
    if (!contact) {
      return null;
    }
    return {
      name: contact.name || null,
      website: contact.website_url || null,
      phone: contact.sanitized_phone || null,
      domain: contact.primary_domain || null,
      address: contact.raw_address || contact.street_address || null,
      city: contact.city || null,
      state: contact.state || null,
      zip: contact.postal_code || null,
      country: contact.country || null,
      description: contact.short_description || contact.seo_description || null,
      foundedYear: contact.founded_year || null,
      size: contact.estimated_num_employees || null,
      industry: contact.industry || null,
      technology: contact.technology_names || null,
      socialMedia: {
        linkedin: contact.linkedin_url || null,
        facebook: contact.facebook_url || null,
        twitter: contact.twitter_url || null,
        instagram: contact.instagram_url || null,
      },
      logUrl: contact.logo_url || null,
    };
  }
}
