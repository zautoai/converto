import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { EnrichmentProvider } from './enrichment.provider';
import { IEnrichment } from './interfaces/enrichment.interface';
import { EnrichmentProviderName } from './enrichment-provider.enum';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { PrismaClientManager } from 'src/prisma/prismaClientManager.service';
import { ContactEnrichmentDto } from './dto/contact-enrich.dto';

@Injectable()
export class EnrichmentService {
  private readonly logger = new Logger(EnrichmentService.name);

  constructor(
    private readonly enrichmentProvider: EnrichmentProvider,
    private readonly prismaClientManager: PrismaClientManager,
    @InjectQueue('enrichment_queue') private enrichmentQueue: Queue,
  ) {}

  async getPeopleByName(
    first_name: string,
    last_name?: string,
    provider: string = EnrichmentProviderName.APOLLO,
  ) {
    return await this.getPeople({ first_name, last_name }, provider);
  }

  async getPeopleByEmail(
    email: string,
    provider: string = EnrichmentProviderName.APOLLO,
  ) {
    return await this.getPeople({ email }, provider);
  }

  async getPeopleByPhone(
    phone_number: string,
    provider: string = EnrichmentProviderName.APOLLO,
  ) {
    return await this.getPeople({ phone_number }, provider);
  }

  async getPeopleByDomain(
    domain: string,
    provider: string = EnrichmentProviderName.APOLLO,
  ) {
    return await this.getPeople({ domain }, provider);
  }

  async getPeople(
    matchRequest: { [key: string]: string },
    provider: string = EnrichmentProviderName.APOLLO,
  ) {
    const enrichmentService: IEnrichment =
      this.enrichmentProvider.getProvider(provider);
    return await enrichmentService.getPeople(matchRequest);
  }

  async getOrganizationByDomain(
    domain: string,
    provider: string = EnrichmentProviderName.APOLLO,
  ) {
    return await this.getOrganization({ domain }, provider);
  }

  async getOrganization(
    matchRequest: { [key: string]: string },
    provider: string = EnrichmentProviderName.APOLLO,
  ) {
    const enrichmentService: IEnrichment =
      this.enrichmentProvider.getProvider(provider);
    return await enrichmentService.getOrganization(matchRequest);
  }

  async enrichContact(
    orgId: string,
    contactId: string,
    provider: string = EnrichmentProviderName.APOLLO,
  ) {
    try {
      const prisma = await this.prismaClientManager.getClient(orgId);
      const contact = await prisma.contact.findUnique({
        where: {
          id: contactId,
        },
      });
      if (!contact) {
        throw new NotFoundException('Contact not found');
      }
      if (!contact.email) {
        throw new BadRequestException('Contact does not have an email');
      }
      this.enrichmentQueue.add(
        provider,
        {
          orgId,
          contactId,
          matchRequest: { email: contact.email },
          type: 'contact',
        },
        {
          delay: 1000,
          removeOnComplete: true,
          attempts: 2,
        },
      );
      this.logger.log(
        `Added enrichment task to queue for contact with email: ${contact.email}`,
      );
      return {
        statusCode: 200,
        status: 'success',
        message: 'Contact enrichment successful',
      };
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async enrichPeopleByContact(
    orgId: string,
    contactId: string,
    matchRequest: { [key: string]: string },
    provider: string = EnrichmentProviderName.APOLLO,
  ) {
    try {
      this.logger.log(`Enriching people with contactId: ${contactId}`);
      const enrichmentService: IEnrichment = this.enrichmentProvider.getProvider(provider);
      const enrichedData = await enrichmentService.getPeople(matchRequest);
      const prisma = await this.prismaClientManager.getClient(orgId);
      const existingContact = await prisma.contact.findUnique({
        where: { id: contactId },
      });
      const enrichedContact = await prisma.contact.update({
        where: { id: contactId },
        data: {
          ...(!existingContact.firstName ? { firstName: enrichedData.firstName }: {}),
          ...(!existingContact.lastName ? { lastName: enrichedData.lastName } : {}),
          ...(!existingContact.fullName ? { fullName: enrichedData.fullName } : {}),
          ...(!existingContact.phone ? { phone: enrichedData.phone } : {}),
          ...(!existingContact.address ? { address: enrichedData.address } : {}),
          ...(!existingContact.website ? { website: enrichedData.website } : {}),
          ...(!existingContact.city ? { city: enrichedData.city } : {}),
          ...(!existingContact.state ? { state: enrichedData.state } : {}),
          ...(!existingContact.zip ? { zip: enrichedData.zip } : {}),
          ...(!existingContact.country ? { country: enrichedData.country } : {}),
          ...(!existingContact.organizationName ? { organizationName: enrichedData.organizationName } : {}),
          ...(!existingContact.jobTitle ? { jobTitle: enrichedData.jobTitle } : {}),
          ...(!existingContact.photoUrl ? { photoUrl: enrichedData.photoUrl } : {}),
          ...(!existingContact.socialMedia ? {socialMedia: enrichedData.socialMedia}: {}),
          ...(!existingContact.notes ? { notes: enrichedData.notes } : {}),
        },
      });
      this.logger.log(`Enriched contact with id: ${contactId}`);
      return enrichedContact;
    } catch (e) {
      console.log(e);
    }
  }
}
