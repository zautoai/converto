import { Controller } from "@nestjs/common";
import { SegmentCategoryService } from "./segment-category.service";
import { MessagePattern } from "@nestjs/microservices";


@Controller()
export class SegmentCategoryMicroController {
    constructor(
        private readonly segmentCategoryService: SegmentCategoryService
    ) { }

    @MessagePattern({ cmd: 'CREATE_SEGMENT_CATEGORY' })
    async createSegmentCategory(data: any) {
        try {
            return await this.segmentCategoryService.create(data.orgId, data.segmentCategory);
        }
        catch (error) {
            return error.response || error
        }
    }

    @MessagePattern({ cmd: 'GET_SEGMENT_CATEGORIES' })
    async getSegmentCategories(data: any) {
        try {
            return await this.segmentCategoryService.findAll(data.orgId);
        } catch (error) {
            return error.response || error
        }
    }

    @MessagePattern({ cmd: 'GET_SEGMENT_CATEGORY' })
    async getSegmentCategory(data: any) {
        try {
            return await this.segmentCategoryService.findOne(data.orgId, data.id);
        } catch (error) {
            return error.response || error
        }
    }

    @MessagePattern({ cmd: 'UPDATE_SEGMENT_CATEGORY' })
    async updateSegmentCategory(data: any) {
        try {
            return await this.segmentCategoryService.update(data.orgId, data.id, data.segmentCategory);
        } catch (error) {
            return error.response || error
        }
    }

    @MessagePattern({ cmd: 'DELETE_SEGMENT_CATEGORY' })
    async deleteSegmentCategory(data: any) {
        try {
            return await this.segmentCategoryService.remove(data.orgId, data.id);
        } catch (error) {
            return error.response || error
        }
    }
}