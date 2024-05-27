import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClientManager } from 'src/prisma/prismaClientManager.service';
import { CreateSegmentCategoryDto } from './dto/create-segment-category.dto';
import { UpdateSegmentCategoryDto } from './dto/update-segment-category.dto';

@Injectable()
export class SegmentCategoryService {

  constructor(
    private readonly prismaClientManager: PrismaClientManager,
  ) { }

  async create(orgId: string, createSegmentCategoryDto: CreateSegmentCategoryDto) {
    const { name } = createSegmentCategoryDto;
    const prisma = await this.prismaClientManager.getClient(orgId)
    try {
      const existingSegmentCategory = await prisma.segmentCategory.findFirst({
        where: {
          name
        }
      });
      if (existingSegmentCategory) {
        throw new BadRequestException('Segment category with the same name already exists');
      }

      await prisma.segmentCategory.create({
        data: createSegmentCategoryDto,
      });
      return {
        code: 201,
        success: true,
        message: 'Create segment category success'
      };
    } catch (error) {
      throw error
    } finally {
      await this.prismaClientManager.disconnectClient(orgId)
    }
  }

  async findAll(orgId: string) {
    const prisma = await this.prismaClientManager.getClient(orgId)
    try {
      const data = await prisma.segmentCategory.findMany();
      return {
        code: 200,
        success: true,
        data,
        message: 'Get all segment category success'
      };
    } catch (error) {
      throw error
    } finally {
      await this.prismaClientManager.disconnectClient(orgId)
    }
  }

  async findOne(orgId: string, id: string) {
    const prisma = await this.prismaClientManager.getClient(orgId);
    try {
      const data = await prisma.segmentCategory.findFirst({
        where: {
          id
        }
      });
      if (!data) {
        throw new NotFoundException('Segment category not found');
      }
      return {
        code: 200,
        success: true,
        data,
        message: 'Get segment category success'
      };
    } catch (error) {
      throw error
    } finally {
      await this.prismaClientManager.disconnectClient(orgId)
    }
  }

  async update(orgId: string, id: string, updateSegmentCategoryDto: UpdateSegmentCategoryDto) {
    const { name } = updateSegmentCategoryDto;
    const prisma = await this.prismaClientManager.getClient(orgId)
    try {
      const existingSegmentCategory = await prisma.segmentCategory.findFirst({
        where: { id }
      });
      if (!existingSegmentCategory) {
        throw new NotFoundException('Segment category not found');
      }

      const existingSegmentCategoryWithSameName = await prisma.segmentCategory.findFirst({
        where: {
          name
        }
      });

      if (existingSegmentCategoryWithSameName && existingSegmentCategoryWithSameName.id !== id) {
        throw new ConflictException('Segment category with the same name already exists');
      }

      await prisma.segmentCategory.update({
        where: { id },
        data: updateSegmentCategoryDto,
      });

      return {
        code: 200,
        success: true,
        message: 'Update segment category success'
      };
    } catch (error) {
      throw error
    } finally {
      await this.prismaClientManager.disconnectClient(orgId)
    }
  }


  async remove(orgId: string, id: string) {
    const prisma = await this.prismaClientManager.getClient(orgId);
    try {
      const existingSegmentCategory = await prisma.segmentCategory.findFirst({
        where: { id }
      });
      if (!existingSegmentCategory) {
        throw new NotFoundException('Segment category not found');
      }

      await prisma.segmentCategory.delete({
        where: { id }
      });

      return {
        code: 200,
        success: true,
        message: 'Delete segment category success'
      };
    }
    catch (error) {
      throw error
    }
    finally {
      await this.prismaClientManager.disconnectClient(orgId)
    }
  }
}
