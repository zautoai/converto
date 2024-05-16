import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { CreateSegmentDto } from './dto/create-segment.dto';
import { UpdateSegmentDto } from './dto/update-segment.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SegmentsService {

  constructor(
    private readonly prisma: PrismaService,
  ) { }


  async create(orgId: string, createSegmentDto: CreateSegmentDto) {
    const { name } = createSegmentDto;
    const existingSegment = await this.prisma.segment.findFirst({
      where: {
        orgId,
        name
      }
    });
    if (existingSegment) {
      throw new ConflictException('Segment with the same name already exists');
    }

    await this.prisma.segment.create({
      data: {
        ...createSegmentDto,
        orgId
      }
    });

    return {
      code: 201,
      success: true,
      message: 'Create segment success'
    };
  }

  async findAll(orgId: string) {
    const data = await this.prisma.segment.findMany({
      where: {
        orgId
      },
      include: {
        segmentGroup: true
      }
    });
    return {
      code: 200,
      success: true,
      data,
      message: 'Get all segments success'
    };
  }

  async findOne(orgId: string, id: string) {
    const data = await this.prisma.segment.findFirst({
      where: {
        orgId,
        id
      },
      include: {
        segmentGroup: true
      }
    });
    if (!data) {
      throw new NotFoundException(`Segment not found`);
    }
    return {
      code: 200,
      success: true,
      data,
      message: `Get segment success`
    };
  }

  async update(orgId: string, id: string, updateSegmentDto: UpdateSegmentDto) {
    const { name } = updateSegmentDto;
    const existingSegment = await this.prisma.segment.findFirst({
      where: {
        orgId,
        id
      }
    });
    if (!existingSegment) {
      throw new NotFoundException(`Segment not found`);
    }

    const existingSegmentWithSameName = await this.prisma.segment.findFirst({
      where: {
        orgId,
        name
      }
    });

    if (existingSegmentWithSameName && existingSegmentWithSameName.id !== id) {
      throw new ConflictException('Segment with the same name already exists');
    }

    const updatedSegment = await this.prisma.segment.update({
      where: {
        id
      },
      data: {
        ...updateSegmentDto,
        orgId
      }
    });

    return {
      code: 200,
      success: true,
      data: updatedSegment,
      message: `Update segment success`
    };
  }

  async remove(orgId: string, id: string) {
    const existingSegment = await this.prisma.segment.findFirst({
      where: {
        id,
        orgId
      }
    });
    if (!existingSegment) {
      throw new NotFoundException(`Segment not found`);
    }

    await this.prisma.segment.delete({
      where: {
        id
      }
    });

    return {
      code: 200,
      success: true,
      message: `Delete segment success`
    };
  }
}
