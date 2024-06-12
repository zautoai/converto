import { Inject, Injectable } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { BaseService } from "src/common/services/base.service";


@Injectable()
export class SegmentMicroService extends BaseService {

    constructor(@Inject('CRM_SERVICE') private readonly CRMClient: ClientProxy) {
        super();
    }

    async createSegment(orgId: string, segment: any) {
        try {
            return this.CRMClient.send({ cmd: 'CREATE_SEGMENT' }, { orgId, segment }).toPromise();
        }
        catch (error) {
            this.logger.error(`Error while creating segment: ${error.message}`);
            throw error;
        }
    }

    async getSegments(orgId: string) {
        try {
            return this.CRMClient.send({ cmd: 'GET_SEGMENTS' }, { orgId }).toPromise();
        }
        catch (error) {
            this.logger.error(`Error while fetching segments: ${error.message}`);
            throw error;
        }
    }

    async getSegment(orgId: string, id: string) {
        try {
            return this.CRMClient.send({ cmd: 'GET_SEGMENT' }, { orgId, id }).toPromise();
        }
        catch (error) {
            this.logger.error(`Error while fetching segment: ${error.message}`);
            throw error;
        }
    }

    async updateSegment(orgId: string, id: string, segment: any) {
        try {
            return this.CRMClient.send({ cmd: 'UPDATE_SEGMENT' }, { orgId, id, segment }).toPromise();
        }
        catch (error) {
            this.logger.error(`Error while updating segment: ${error.message}`);
            throw error;
        }
    }

    async deleteSegment(orgId: string, id: string) {
        try {
            return this.CRMClient.send({ cmd: 'DELETE_SEGMENT' }, { orgId, id }).toPromise();
        }
        catch (error) {
            this.logger.error(`Error while deleting segment: ${error.message}`);
            throw error;
        }
    }
}