
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { BaseService } from 'src/common/services/base.service';

@Injectable()
export class IcpMicroService extends BaseService {

    constructor(@Inject('CRM_SERVICE') private readonly CRMClient: ClientProxy) {
        super();
    }

    async createIcp(orgId: string, icp: any) {
        try {
            return this.CRMClient.send({ cmd: 'CREATE_ICP' }, { orgId, icp }).toPromise();
        }
        catch (error) {
            this.logger.error(`Error while creating icp: ${error.message}`);
            throw error;
        }
    }


    async getIcps(orgId: string) {
        try {
            return this.CRMClient.send({ cmd: 'GET_ICPs' }, { orgId }).toPromise();
        }
        catch (error) {
            this.logger.error(`Error while fetching icps: ${error.message}`);
            throw error;
        }
    }

    async getIcp(orgId: string, icpId: string) {
        try {
            return this.CRMClient.send({ cmd: 'GET_ICP' }, { orgId, icpId }).toPromise();
        }
        catch (error) {
            this.logger.error(`Error while fetching icp: ${error.message}`);
            throw error;
        }
    }

    async updateIcp(orgId: string, id: string, icp: any) {
        try {
            return this.CRMClient.send({ cmd: 'UPDATE_ICP' }, { orgId, id, icp }).toPromise();
        }
        catch (error) {
            this.logger.error(`Error while updating icp: ${error.message}`);
            throw error;
        }
    }

    async deleteIcp(orgId: string, id: string) {
        try {
            return this.CRMClient.send({ cmd: 'DELETE_ICP' }, { orgId, id }).toPromise();
        }
        catch (error) {
            this.logger.error(`Error while deleting icp: ${error.message}`);
            throw error;
        }
    }
}