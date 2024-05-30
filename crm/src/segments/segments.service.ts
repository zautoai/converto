import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { CreateSegmentDto } from './dto/create-segment.dto';
import { UpdateSegmentDto } from './dto/update-segment.dto';
import { PrismaClientManager } from 'src/prisma/prismaClientManager.service';

@Injectable()
export class SegmentsService {

  constructor(
    private readonly prismaClientManager: PrismaClientManager,
  ) { }


  async create(orgId: string, createSegmentDto: CreateSegmentDto) {
    const { name } = createSegmentDto;
    const prisma = await this.prismaClientManager.getClient(orgId);
    try {
      const existingSegment = await prisma.segment.findFirst({
        where: {
          name
        }
      });
      if (existingSegment) {
        throw new ConflictException('Segment with the same name already exists');
      }

      await prisma.segment.create({
        data: createSegmentDto
      });

      return {
        code: 201,
        success: true,
        message: 'Create segment success'
      };
    } catch (error) {
      throw error
    } finally {
      prisma.$disconnect()
      await this.prismaClientManager.disconnectClient(orgId)
    }
  }

  async findAll(orgId: string) {
    const prisma = await this.prismaClientManager.getClient(orgId);
    try {
      const data = await prisma.segment.findMany({
        include: {
          segmentCategory: true
        }
      });
      return {
        code: 200,
        success: true,
        data,
        message: 'Get all segments success'
      };
    } catch (error) {
      throw error
    } finally {
      prisma.$disconnect()
      await this.prismaClientManager.disconnectClient(orgId)
    }
  }

  async findOne(orgId: string, id: string) {
    const prisma = await this.prismaClientManager.getClient(orgId);
    try {
      const data = await prisma.segment.findFirst({
        where: {
          id
        },
        include: {
          segmentCategory: true
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
    } catch (error) {
      throw error
    } finally {
      prisma.$disconnect()
      await this.prismaClientManager.disconnectClient(orgId)
    }
  }

  async update(orgId: string, id: string, updateSegmentDto: UpdateSegmentDto) {
    const { name } = updateSegmentDto;
    const prisma = await this.prismaClientManager.getClient(orgId);
    try {
      const existingSegment = await prisma.segment.findFirst({
        where: {
          id
        }
      });
      if (!existingSegment) {
        throw new NotFoundException(`Segment not found`);
      }

      if (name) {
        const existingSegmentWithSameName = await prisma.segment.findFirst({
          where: {
            name
          }
        });

        if (existingSegmentWithSameName && existingSegmentWithSameName.id !== id) {
          throw new ConflictException('Segment with the same name already exists');
        }
      }
      const updatedSegment = await prisma.segment.update({
        where: {
          id
        },
        data: updateSegmentDto,
      });

      return {
        code: 200,
        success: true,
        data: updatedSegment,
        message: `Update segment success`
      };
    } catch (error) {
      throw error
    } finally {
      prisma.$disconnect()
      await this.prismaClientManager.disconnectClient(orgId)
    }
  }

  async remove(orgId: string, id: string) {
    const prisma = await this.prismaClientManager.getClient(orgId);
    try {
      const existingSegment = await prisma.segment.findFirst({
        where: {
          id,
        }
      });
      if (!existingSegment) {
        throw new NotFoundException(`Segment not found`);
      }

      await prisma.segment.delete({
        where: {
          id
        }
      });

      return {
        code: 200,
        success: true,
        message: `Delete segment success`
      };
    } catch (error) {
      throw error
    } finally {
      prisma.$disconnect()
      await this.prismaClientManager.disconnectClient(orgId)
    }
  }
}
