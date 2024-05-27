import { Controller } from "@nestjs/common";
import { SegmentsService } from "./segments.service";
import { MessagePattern } from "@nestjs/microservices";


@Controller()
export class SegmentMicroController {

    constructor(
        private readonly segmentsService: SegmentsService
    ) { }


    @MessagePattern('CREATE_SEGMENT')
    async createSegment(data: any) {
        return await this.segmentsService.create(data.orgId, data.segment);
    }

    @MessagePattern('GET_SEGMENTS')
    async getSegments(data: any) {
        return await this.segmentsService.findAll(data.orgId);
    }

    @MessagePattern('GET_SEGMENT')
    async getSegment(data: any) {
        return await this.segmentsService.findOne(data.orgId, data.id);
    }

    @MessagePattern('UPDATE_SEGMENT')
    async updateSegment(data: any) {
        return await this.segmentsService.update(data.orgId, data.id, data.segment);
    }

    @MessagePattern('DELETE_SEGMENT')
    async deleteSegment(data: any) {
        return await this.segmentsService.remove(data.orgId, data.id);
    }
}