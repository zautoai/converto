import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClientManager } from './../prisma/prismaClientManager.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { FilterDto } from 'src/common/dtos/filter.dto';

@Injectable()
export class TagsService {
  constructor(private readonly prismaClientManager: PrismaClientManager) { }

  async getAllTags(orgId: string, filterDto: FilterDto) {
    const { page, limit, sort, searchTerm } = filterDto;
    const skip = (page - 1) * limit;
    const prisma = await this.prismaClientManager.getClient(orgId);
    try {
      const tags = await prisma.tag.findMany({
        where: {
          ...(searchTerm
            ? {
              OR: [
                { name: { contains: searchTerm } },
                { description: { contains: searchTerm } },
              ],
            }
            : {}),
        },
        take: limit,
        skip: skip,
        orderBy: {
          createdAt: sort,
        },
      });
      const total = await prisma.tag.count({
        where: {
          ...(searchTerm
            ? {
              OR: [
                { name: { contains: searchTerm } },
                { description: { contains: searchTerm } },
              ],
            }
            : {}),
        },
        take: limit,
        skip: skip,
      });
      return {
        code: 200,
        success: true,
        message: 'Tags fetched successfully',
        data: tags,
        page: page,
        total: total,
      };
    } catch (error) {
      throw error
    } finally {
      prisma.$disconnect()
      await this.prismaClientManager.disconnectClient(orgId)
    }
  }

  async getTagById(orgId: string, id: string) {
    const prisma = await this.prismaClientManager.getClient(orgId);
    try {
      const tag = await prisma.tag.findUnique({ where: { id } });
      if (!tag) {
        throw new NotFoundException('Tag not found');
      }
      return {
        code: 200,
        success: true,
        message: 'Tag fetched successfully',
        data: tag,
      };
    } catch (error) {
      throw error
    } finally {
      prisma.$disconnect()
      await this.prismaClientManager.disconnectClient(orgId)
    }
  }

  async createTag(orgId: string, createTagDto: CreateTagDto) {
    const prisma = await this.prismaClientManager.getClient(orgId);
    try {
      const tag = await prisma.tag.create({ data: createTagDto });
      return {
        code: 201,
        success: true,
        message: 'Tag created successfully',
      };
    } catch (error) {
      throw error
    } finally {
      prisma.$disconnect()
      await this.prismaClientManager.disconnectClient(orgId)
    }
  }

  async updateTag(orgId: string, id: string, updateTagDto: UpdateTagDto) {
    const prisma = await this.prismaClientManager.getClient(orgId);
    try {
      await this.getTagById(orgId, id);
      const tag = await prisma.tag.update({ where: { id }, data: updateTagDto });
      return {
        code: 200,
        success: true,
        message: 'Tag updated successfully',
      };
    } catch (error) {
      throw error
    } finally {
      prisma.$disconnect()
      await this.prismaClientManager.disconnectClient(orgId)
    }
  }

  async deleteTag(orgId: string, id: string) {
    const prisma = await this.prismaClientManager.getClient(orgId);
    try {
      await this.getTagById(orgId, id);
      const tag = await prisma.tag.delete({ where: { id } });
      return {
        code: 204,
        success: true,
        message: 'Tag deleted successfully',
      };
    } catch (error) {
      throw error
    } finally {
      prisma.$disconnect()
      await this.prismaClientManager.disconnectClient(orgId)
    }
  }
}
