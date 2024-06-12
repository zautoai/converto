import { Controller } from "@nestjs/common";
import { SegmentsService } from "./segments.service";
import { MessagePattern } from "@nestjs/microservices";


@Controller()
export class SegmentMicroController {

    constructor(
        private readonly segmentsService: SegmentsService
    ) { }


    @MessagePattern({ cmd: 'CREATE_SEGMENT' })
    async createSegment(data: any) {
        try {
            return await this.segmentsService.create(data.orgId, data.segment);
        } catch (error) {
            return error.response || error
        }
    }

    @MessagePattern({ cmd: 'GET_SEGMENTS' })
    async getSegments(data: any) {
        try {
            return await this.segmentsService.findAll(data.orgId);
        } catch (error) {
            return error.response || error
        }
    }

    @MessagePattern({ cmd: 'GET_SEGMENT' })
    async getSegment(data: any) {
        try {
            return await this.segmentsService.findOne(data.orgId, data.id);
        } catch (error) {
            return error.response || error
        }
    }

    @MessagePattern({ cmd: 'UPDATE_SEGMENT' })
    async updateSegment(data: any) {
        try {
            return await this.segmentsService.update(data.orgId, data.id, data.segment);
        } catch (error) {
            return error.response || error
        }
    }

    @MessagePattern({ cmd: 'DELETE_SEGMENT' })
    async deleteSegment(data: any) {
        try {
            return await this.segmentsService.remove(data.orgId, data.id);
        } catch (error) {
            return error.response || error
        }
    }
}