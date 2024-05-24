import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { EnrichmentProvider } from './enrichment.provider';
import { IEnrichment } from './interfaces/enrichment.interface';
import { EnrichmentProviderName } from './enrichment-provider.enum';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { PrismaClientManager } from 'src/prisma/prismaClientManager.service';
import { ExternalCrmService } from 'src/external-crm/external-crm.service';
import { CrmNames } from 'src/external-crm/enum/external-crm.enum';

@Injectable()
export class EnrichmentService {
  private readonly logger = new Logger(EnrichmentService.name);

  constructor(
    private readonly enrichmentProvider: EnrichmentProvider,
    private readonly prismaClientManager: PrismaClientManager,
    @InjectQueue('enrichment_queue') private enrichmentQueue: Queue,
    private readonly externalCrmService: ExternalCrmService
  ) { }

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

  async enrichContact(orgId: string, contactId: string, provider: string = EnrichmentProviderName.APOLLO,) {
    const prisma = await this.prismaClientManager.getClient(orgId);
    try {
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
      this.enrichmentQueue.add(provider, { orgId, id: contactId, matchRequest: { email: contact.email }, type: 'contact', }, { delay: 1000, removeOnComplete: true, attempts: 2, },);
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
    } finally {
      await this.prismaClientManager.disconnectClient(orgId)
    }
  }

  async enrichAccount(orgId: string, accountId: string, provider: string = EnrichmentProviderName.APOLLO,) {
    const prisma = await this.prismaClientManager.getClient(orgId);
    try {
      const account = await prisma.account.findUnique({
        where: {
          id: accountId,
        },
      });
      if (!account) {
        throw new NotFoundException('Account not found');
      }
      this.enrichmentQueue.add(provider, { orgId, id: accountId, matchRequest: { domain: account.domain }, type: 'account', }, { delay: 1000, removeOnComplete: true, attempts: 2, },);
      this.logger.log(
        `Added enrichment task to queue for account with domain: ${account.domain}`,
      );
      return {
        statusCode: 200,
        status: 'success',
        message: 'Account enrichment successful',
      };
    } catch (error) {
      throw new BadRequestException(error);
    } finally {
      await this.prismaClientManager.disconnectClient(orgId)
    }
  }
}
