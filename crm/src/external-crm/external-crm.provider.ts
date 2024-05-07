import { Injectable, NotFoundException } from '@nestjs/common';
import { BaseExternalCrm } from './external-crm.model';
import { CrmNames } from './enum/external-crm.enum';
import { HubspotService } from './providers/hubspot.service';

@Injectable()
export class ExternalCrmProvider {

    providers: { [key: string]: BaseExternalCrm } = {};

    constructor(
        private readonly hubspotService:HubspotService
    )
    {
        this.providers[CrmNames.HUBSPOT] = this.hubspotService;
    }

    getCRM(name: string): BaseExternalCrm {
        const crm = this.providers[name];
        if(!crm)
        {
            throw new NotFoundException(`Invalid CRM name ${name}`);   
        }
        return crm;
    }
}
