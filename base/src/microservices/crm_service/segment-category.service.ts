import { Inject, Injectable } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { BaseService } from "src/common/services/base.service";


@Injectable()
export class SegmentCategoryMicroService extends BaseService {

    constructor(@Inject('CRM_SERVICE') private readonly CRMClient: ClientProxy) {
        super();
    }

    async createSegmentCategory(orgId: string, segmentCategory: any) {
        try {
            return this.CRMClient.send({ cmd: 'CREATE_SEGMENT_CATEGORY' }, { orgId, segmentCategory }).toPromise();
        }
        catch (error) {
            this.logger.error(`Error while creating segment category: ${error.message}`);
            throw error;
        }
    }

    async getSegmentCategories(orgId: string) {
        try {
            return this.CRMClient.send({ cmd: 'GET_SEGMENT_CATEGORIES' }, { orgId }).toPromise();
        }
        catch (error) {
            this.logger.error(`Error while fetching segment categories: ${error.message}`);
            throw error;
        }
    }

    async getSegmentCategory(orgId: string, id: string) {
        try {
            return this.CRMClient.send({ cmd: 'GET_SEGMENT_CATEGORY' }, { orgId, id }).toPromise();
        }
        catch (error) {
            this.logger.error(`Error while fetching segment category: ${error.message}`);
            throw error;
        }
    }

    async updateSegmentCategory(orgId: string, id: string, segmentCategory: any) {
        try {
            return this.CRMClient.send({ cmd: 'UPDATE_SEGMENT_CATEGORY' }, { orgId, id, segmentCategory }).toPromise();
        }
        catch (error) {
            this.logger.error(`Error while updating segment category: ${error.message}`);
            throw error;
        }
    }


    async deleteSegmentCategory(orgId: string, id: string) {
        try {
            return this.CRMClient.send({ cmd: 'DELETE_SEGMENT_CATEGORY' }, { orgId, id }).toPromise();
        }
        catch (error) {
            this.logger.error(`Error while deleting segment category: ${error.message}`);
            throw error;
        }
    }
}