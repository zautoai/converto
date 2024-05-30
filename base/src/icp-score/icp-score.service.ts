import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { ContactService } from 'src/microservices/crm_service/contact.service';

@Injectable()
export class IcpScoreService {

    constructor(
        private readonly contactService: ContactService,
        @InjectQueue('icp_score_queue') private enrichmentQueue: Queue
    ) { }

    async generateScoreForAllContact(orgId: string) {
        const totalpage = (await this.contactService.getContacts(orgId)).total;
    }
}
