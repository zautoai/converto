import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { ContactService } from 'src/microservices/crm_service/contact.service';
import { IcpMicroService } from 'src/microservices/crm_service/icp.service';

@Injectable()
export class IcpScoreService {

    constructor(
        private readonly contactService: ContactService,
        private readonly icpService: IcpMicroService,
        @InjectQueue('icp_score_queue') private enrichmentQueue: Queue
    ) { }

    async generateAllIcpScore(orgId: string) {
        const Icplist = await this.icpService.getIcps(orgId);
        const limit = 20;
        let pageNo = 1;
        let totalContacts = 0;
        let totalPages = 1;

        let response = await this.contactService.getContacts(orgId, { page: pageNo, limit: limit });
        totalContacts = response.total;
        totalPages = Math.ceil(totalContacts / limit);

        let contacts = response.data;
        for (const contact of contacts) {

        }

        while (pageNo < totalPages) {
            pageNo++;
            response = await this.contactService.getContacts(orgId, { page: pageNo, limit: limit });
            contacts = response.data;

            for (const contact of contacts) {

            }
        }
    }
}
