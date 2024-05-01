import { BadRequestException, Injectable } from '@nestjs/common';
import { IEnrichment } from '../interfaces/enrichment.interface';
import { buildQueryString } from 'src/common/utils/cast.helper';
import { WebClientService } from 'src/common/services/web-client.service';

@Injectable()
export class ZoomInfoService implements IEnrichment {
  api_key: string;

  constructor(private readonly webClient: WebClientService) {
    this.api_key = process.env.ZOOMINFO_API_KEY;
  }

  async getPeople(matchRequest: { [key: string]: string }): Promise<IContact> {
    try {
      const queryString = buildQueryString(matchRequest);
      const url = `http://localhost:8080/zoominfo?${queryString}`;
      const response = await this.webClient.get(url);
      return this.handlePersonResponse(response);
    } catch (error) {
      console.error(error);
      throw new BadRequestException(
        error.message || 'Something went wrong. Please try again later.',
      );
    }
  }

  getOrganization(matchRequest: {
    [key: string]: string;
  }): Promise<IOrganization> {
    throw new Error('Method not implemented.');
  }

  handlePersonResponse(response: any): IContact {
    const contact = response.data.result[0].data[0];

    if (!contact) {
      return null;
    }
    return {
      id: contact.id || '',
      photoUrl: contact.picture || '',
      firstName: contact.firstName || '',
      lastName: contact.firstName || '',
      email: contact.email || '',
      phone: contact.phone || '',
      jobTitle: contact.jobTitle || '',
      salutation: contact.salutation || '',
      organizationName: contact.company.name || '',
      organization: {
        logoUrl: contact.company.logo || '',
        name: contact.company.name || '',
        website: contact.company.website || '',
        phone: contact.company.sanitized_phone || '',
        domain: contact.company.primary_domain || '',
        address: contact.company.raw_address || contact.company.street || '',
        city: contact.company.city || '',
        state: contact.company.state || '',
        zip: contact.company.zipCode || '',
        country: contact.company.country || '',
        description: contact.company.descriptionList[0].description || '',
        size: contact.company.employeeCount || '',
        industry: contact.company.primaryIndustry[0] || '',
        foundedYear: contact.company.founded_year || '',
        socialMedia:
          this.convertExternalUrlsToSocialMedia(
            contact.company.socialMediaUrls,
          ) || {},
      },
      address: contact.address || contact.street || '',
      city: contact.city || '',
      state: contact.state || '',
      zip: contact.zipCode || '',
      country: contact.country || '',
      socialMedia:
        this.convertExternalUrlsToSocialMedia(contact.externalUrls) || {},
    };
  }

  handleOrganizationResponse(response: any): IOrganization {
    throw new Error('Method not implemented.');
  }

  convertExternalUrlsToSocialMedia(externalUrls) {
    let socialMedia = {
      linkedin: '',
      facebook: '',
      twitter: '',
      instagram: '',
    };
    externalUrls.forEach((urlObj) => {
      switch (urlObj.type) {
        case 'linkedin.com':
          socialMedia.linkedin = urlObj.url || '';
          break;
        case 'twitter.com':
          socialMedia.twitter = urlObj.url || '';
          break;
        case 'facebook.com':
          socialMedia.facebook = urlObj.url || '';
          break;
        case 'instagram.com':
          socialMedia.instagram = urlObj.url || '';
          break;
        default:
          break;
      }
    });

    return socialMedia;
  }
}
