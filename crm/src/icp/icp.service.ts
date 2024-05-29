import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateIcpDto } from './dto/create-icp.dto';
import { UpdateIcpDto } from './dto/update-icp.dto';
import { PrismaClientManager } from 'src/prisma/prismaClientManager.service';

@Injectable()
export class IcpService {

  constructor(
    private readonly prismaClientManager: PrismaClientManager,
  ) { }

  async create(orgId: string, createIcpDto: CreateIcpDto) {
    const { name } = createIcpDto
    const prisma = await this.prismaClientManager.getClient(orgId);
    try {
      const existingIcp = await prisma.icp.findFirst({
        where: {
          name
        }
      })
      if (existingIcp) {
        throw new Error('ICP with the same name already exists')
      }
      const segmentIds = createIcpDto.segmentIds;
      delete createIcpDto.segmentIds;
      const icp = await prisma.icp.create({
        data: createIcpDto
      })
      for (let segmentId of segmentIds) {
        await prisma.icpMap.create({
          data: {
            icpId: icp.id,
            segmentId
          }
        })
      }
      return {
        code: 201,
        success: true,
        message: 'Create Icp success'
      }
    }
    catch (error) {
      throw error
    }
    finally {
      await this.prismaClientManager.disconnectClient(orgId)
    }
  }

  async findAll(orgId: string,) {
    const prisma = await this.prismaClientManager.getClient(orgId);
    try {
      const data = await prisma.icp.findMany({
        include: {
          IcpMap: {
            include: {
              segment: { include: { segmentCategory: true } }
            }
          }
        }
      });
      const formattedData = data.map(icp => ({
        id: icp.id,
        name: icp.name,
        description: icp.description,
        score: icp.score,
        segment: icp.IcpMap.map(icpMap => ({
          id: icpMap.segment.id,
          name: icpMap.segment.name,
          description: icpMap.segment.description,
          segmentCategoryId: icpMap.segment.segmentCategoryId,
          segmentCategory: icpMap.segment.segmentCategory
        }))
      }));

      return {
        code: 200,
        success: true,
        data: formattedData
      }
    }
    catch (error) {
      throw error
    }
    finally {
      await this.prismaClientManager.disconnectClient(orgId)
    }
  }

  async findOne(orgId: string, id: string) {
    const prisma = await this.prismaClientManager.getClient(orgId);
    try {
      const data = await prisma.icp.findFirst({
        where: {
          id
        },
        include: {
          IcpMap: {
            include: {
              segment: { include: { segmentCategory: true } }
            }
          }
        }
      });
      if (!data) {
        throw new NotFoundException('ICP not found')
      }
      const formattedData = {
        id: data.id,
        name: data.name,
        description: data.description,
        score: data.score,
        segment: data.IcpMap.map(icpMap => ({
          id: icpMap.segment.id,
          name: icpMap.segment.name,
          description: icpMap.segment.description,
          segmentCategoryId: icpMap.segment.segmentCategoryId,
          segmentCategory: icpMap.segment.segmentCategory
        }))
      }
      return {
        code: 200,
        success: true,
        data: formattedData
      }
    }
    catch (error) {
      throw error
    }
    finally {
      await this.prismaClientManager.disconnectClient(orgId)
    }
  }

  async update(orgId: string, id: string, updateIcpDto: UpdateIcpDto) {
    const { name } = updateIcpDto
    const prisma = await this.prismaClientManager.getClient(orgId);
    try {
      const existingIcp = await prisma.icp.findFirst({
        where: {
          id
        }
      })
      if (!existingIcp) {
        throw new NotFoundException('ICP not found')
      }
      if (name) {

        const existingIcpWithSameName = await prisma.icp.findFirst({
          where: {
            name
          }
        })
        if (existingIcpWithSameName && existingIcpWithSameName.id !== id) {
          console.log(existingIcpWithSameName.id, id);

          throw new ConflictException('ICP with the same name already exists')
        }
      }

      const segmentIds = updateIcpDto.segmentIds;
      delete updateIcpDto.segmentIds;
      await prisma.icp.update({
        where: {
          id
        },
        data: updateIcpDto
      })

      if (segmentIds) {
        await prisma.icpMap.deleteMany({
          where: {
            icpId: id
          }
        })

        for (let segmentId of segmentIds) {
          await prisma.icpMap.create({
            data: {
              icpId: id,
              segmentId
            }
          })
        }
      }
      return {
        code: 200,
        success: true,
        message: 'Update Icp success'
      }
    }
    catch (error) {
      throw error
    }
    finally {
      await this.prismaClientManager.disconnectClient(orgId)
    }
  }

  async remove(orgId: string, id: string) {
    const prisma = await this.prismaClientManager.getClient(orgId);
    try {
      const existingIcp = await prisma.icp.findFirst({
        where: {
          id
        }
      })
      if (!existingIcp) {
        throw new NotFoundException('ICP not found')
      }
      await prisma.icp.delete({
        where: {
          id
        }
      })
      return {
        code: 200,
        success: true,
        message: 'Delete Icp success'
      }
    }
    catch (error) {
      throw error
    }
    finally {
      await this.prismaClientManager.disconnectClient(orgId)
    }
  }
}
