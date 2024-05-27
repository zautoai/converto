import { Injectable } from '@nestjs/common';
import { CreateSegmentCategoryDto } from './dto/create-segment-category.dto';
import { UpdateSegmentCategoryDto } from './dto/update-segment-category.dto';
import { BaseService } from 'src/common/services/base.service';
import { SegmentCategoryMicroService } from 'src/microservices/crm_service/segment-category.service';

@Injectable()
export class SegmentCategoryService extends BaseService {

  constructor(private readonly segmentsCategoryService: SegmentCategoryMicroService) {
    super();
  }

  async create(orgId: string, createSegmentCategoryDto: CreateSegmentCategoryDto) {
    return this.handleException(
      await this.segmentsCategoryService.createSegmentCategory(orgId, createSegmentCategoryDto),
    );
  }

  async findAll(orgId: string) {
    return this.handleException(
      await this.segmentsCategoryService.getSegmentCategories(orgId),
    );
  }

  async findOne(orgId: string, id: string) {
    return this.handleException(
      await this.segmentsCategoryService.getSegmentCategory(orgId, id),
    );
  }

  async update(orgId: string, id: string, updateSegmentCategoryDto: UpdateSegmentCategoryDto) {
    return this.handleException(
      await this.segmentsCategoryService.updateSegmentCategory(orgId, id, updateSegmentCategoryDto),
    );
  }

  async remove(orgId: string, id: string) {
    return this.handleException(
      await this.segmentsCategoryService.deleteSegmentCategory(orgId, id),
    );
  }
}
