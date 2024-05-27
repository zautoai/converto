import { Controller } from "@nestjs/common";
import { SegmentCategoryService } from "./segment-category.service";
import { MessagePattern } from "@nestjs/microservices";


@Controller()
export class SegmentCategoryMicroController {
    constructor(
        private readonly segmentCategoryService: SegmentCategoryService
    ) { }

    @MessagePattern('CREATE_SEGMENT_CATEGORY')
    async createSegmentCategory(data: any) {
        return await this.segmentCategoryService.create(data.orgId, data.segmentCategory);
    }

    @MessagePattern('GET_SEGMENT_CATEGORIES')
    async getSegmentCategories(data: any) {
        return await this.segmentCategoryService.findAll(data.orgId);
    }

    @MessagePattern('GET_SEGMENT_CATEGORY')
    async getSegmentCategory(data: any) {
        return await this.segmentCategoryService.findOne(data.orgId, data.id);
    }

    @MessagePattern('UPDATE_SEGMENT_CATEGORY')
    async updateSegmentCategory(data: any) {
        return await this.segmentCategoryService.update(data.orgId, data.id, data.segmentCategory);
    }

    @MessagePattern('DELETE_SEGMENT_CATEGORY')
    async deleteSegmentCategory(data: any) {
        return await this.segmentCategoryService.remove(data.orgId, data.id);
    }
}