import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { EnrichmentService } from '../../enrichment/enrichment.service';
import { ContactsService } from 'src/contacts/contacts.service';
import { AccountsService } from 'src/accounts/accounts.service';

@Processor('enrichment_queue')
export class EnrichmentProcessor {
  private readonly logger = new Logger(EnrichmentProcessor.name);

  constructor(
    private readonly accountService: AccountsService,
    private readonly contactService: ContactsService,
  ) {}

  @Process('Apollo')
  async handleApollo(job: any) {
    this.logger.log('Processing Apollo enrichment');
    const { orgId, id, provider, matchRequest, type } = job.data;
    switch(type)
    {
      case 'contact':
      {
        await this.contactService.enrichPeopleByContact(
          orgId,
          id,
          matchRequest,
          provider,
        );
        break;
      }
      case 'account':
      {
        await this.accountService.enrichAccountById(
          orgId,
          id,
          matchRequest,
          provider,
        );
        break;
      }
      default:
      {
        this.logger.error('Unknown type');
        break;
      }
    }
    
  }
}
