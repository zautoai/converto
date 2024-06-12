import { Injectable } from '@nestjs/common';
import { CreateSegmentDto } from './dto/create-segment.dto';
import { UpdateSegmentDto } from './dto/update-segment.dto';
import { BaseService } from 'src/common/services/base.service';
import { SegmentMicroService } from 'src/microservices/crm_service/segment.service';

@Injectable()
export class SegmentsService extends BaseService {

  constructor(private readonly segmentsService: SegmentMicroService) {
    super();
  }


  async create(orgId: string, createSegmentDto: CreateSegmentDto) {
    return this.handleException(
      await this.segmentsService.createSegment(orgId, createSegmentDto),
    );
  }

  async findAll(orgId: string,) {
    return this.handleException(
      await this.segmentsService.getSegments(orgId),
    );
  }

  async findOne(orgId: string, id: string) {
    return this.handleException(
      await this.segmentsService.getSegment(orgId, id),
    );
  }

  async update(orgId: string, id: string, updateSegmentDto: UpdateSegmentDto) {
    return this.handleException(
      await this.segmentsService.updateSegment(orgId, id, updateSegmentDto),
    );
  }

  async remove(orgId: string, id: string) {
    return this.handleException(
      await this.segmentsService.deleteSegment(orgId, id),
    );
  }
}
