import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { CreateSegmentGroupDto } from './dto/create-segment-group.dto';
import { UpdateSegmentGroupDto } from './dto/update-segment-group.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SegmentGroupService {

  constructor(
    private readonly prisma: PrismaService,
  ) { }

  async create(orgId: string, createSegmentGroupDto: CreateSegmentGroupDto) {
    const { name } = createSegmentGroupDto;
    const existingSegmentGroup = await this.prisma.segmentGroup.findFirst({
      where: {
        orgId,
        name
      }
    });
    if (existingSegmentGroup) {
      throw new ConflictException('Segment group with the same name already exists');
    }

    await this.prisma.segmentGroup.create({
      data: {
        ...createSegmentGroupDto,
        orgId
      }
    });
    return {
      code: 201,
      success: true,
      message: 'Create segment group success'
    };
  }

  async findAll(orgId: string) {
    const data = await this.prisma.segmentGroup.findMany({
      where: {
        orgId
      }
    });
    return {
      code: 200,
      success: true,
      data,
      message: 'Get all segment group success'
    };
  }

  async findOne(orgId: string, id: string) {
    const data = await this.prisma.segmentGroup.findFirst({
      where: {
        orgId,
        id
      }
    });
    if (!data) {
      throw new NotFoundException('Segment group not found');
    }
    return {
      code: 200,
      success: true,
      data,
      message: 'Get segment group success'
    };
  }

  async update(orgId: string, id: string, updateSegmentGroupDto: UpdateSegmentGroupDto) {
    const { name } = updateSegmentGroupDto;
    const existingSegmentGroup = await this.prisma.segmentGroup.findFirst({
      where: {
        orgId,
        id
      }
    });
    if (!existingSegmentGroup) {
      throw new NotFoundException('Segment group not found');
    }

    const existingSegmentGroupWithSameName = await this.prisma.segmentGroup.findFirst({
      where: {
        orgId,
        name
      }
    });

    if (existingSegmentGroupWithSameName && existingSegmentGroupWithSameName.id !== id) {
      throw new ConflictException('Segment group with the same name already exists');
    }

    await this.prisma.segmentGroup.update({
      where: {
        id
      },
      data: {
        ...updateSegmentGroupDto,
        orgId
      }
    });

    return {
      code: 200,
      success: true,
      message: 'Update segment group success'
    };
  }


  async remove(orgId: string, id: string) {
    const existingSegmentGroup = await this.prisma.segmentGroup.findFirst({
      where: {
        id,
        orgId
      }
    });
    if (!existingSegmentGroup) {
      throw new NotFoundException('Segment group not found');
    }

    await this.prisma.segmentGroup.delete({
      where: {
        id
      }
    });

    return {
      code: 200,
      success: true,
      message: 'Delete segment group success'
    };
  }
}
