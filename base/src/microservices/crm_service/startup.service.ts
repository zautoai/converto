import { Inject, Injectable, Logger } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { BaseService } from "src/common/services/base.service";

@Injectable()
export class StartupMicroService {
    private logger = new Logger(StartupMicroService.name);

    constructor(@Inject('CRM_SERVICE') private readonly CRMClient: ClientProxy) { }

    async syncOrganizations() {
        try {
            this.logger.log('Syncing Organizations')
            return this.CRMClient.send({ cmd: 'SYNC_ORGANIZATIONS' }, {}).toPromise()
        }
        catch (error) {
            this.logger.error('Error in syncing organizations')
            throw error
        }
    }

    async syncSingleOrganization(orgId: string) {
        try {
            this.logger.log('Syncing Single Organization')
            return this.CRMClient.send({ cmd: 'SYNC_SINGLE_ORGANIZATION' }, {orgId}).toPromise()
        }
        catch (error) {
            this.logger.error('Error in syncing single organization')
            throw error
        }
    }
}
