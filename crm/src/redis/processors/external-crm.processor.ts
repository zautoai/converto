import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { ExternalCrmService } from '../../external-crm/external-crm.service';
import { ContactsService } from 'src/contacts/contacts.service';

@Processor('crm_sync_queue')
export class ExternalCrmProcessor {
  private readonly logger = new Logger(ExternalCrmProcessor.name);

  constructor(
    private readonly externalCrmService: ExternalCrmService,
    private readonly contactService: ContactsService
  ) {}

  @Process('CreateContact')
  async handleCreateContact(job: any) {
    this.logger.log(`CreateContact job started`);
    const { orgId, crmName, data } = job.data;
    console.log(data);
    
  }
}
