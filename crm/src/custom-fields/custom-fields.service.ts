import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { convertToKey, getSchemaName } from 'src/common/utils/cast.helper';
import { PrismaClientManager } from 'src/prisma/prismaClientManager.service';
import { CreateFieldDto } from './dto/create-fields.dto';
import { UpdateFiledDto } from './dto/update-fields.dto';
import { CustomFieldParent } from 'src/common/enum/enums';

@Injectable()
export class CustomFieldsService {
  constructor(private readonly prismaClientManager: PrismaClientManager) { }

  async create(orgId: string, createFieldDto: CreateFieldDto) {
    const prisma = await this.prismaClientManager.getClient(orgId);
    try {
      const key = convertToKey(createFieldDto.name);
      await this.getByName(orgId, createFieldDto.name);
      const newField = await prisma.customField.create({
        data: {
          key,
          ...createFieldDto,
        },
      });
      return newField;
    } catch (error) {
      throw error
    } finally {
      prisma.$disconnect()
      await this.prismaClientManager.disconnectClient(orgId)
    }
  }

  async update(orgId: string, id: string, updateFieldDto: UpdateFiledDto) {
    const prisma = await this.prismaClientManager.getClient(orgId);
    try {
      let key = null;
      if (updateFieldDto.name) {
        key = convertToKey(updateFieldDto.name);
        await this.getByName(orgId, updateFieldDto.name);
      }
      const data = {
        ...(key ? { key } : {}),
        ...updateFieldDto,
      };
      const updatedField = await prisma.customField.update({
        where: {
          id,
        },
        data: data,
      });
      return updatedField;
    } catch (error) {
      throw error
    } finally {
      prisma.$disconnect()
      await this.prismaClientManager.disconnectClient(orgId)
    }
  }

  async delete(orgId: string, id: string) {
    const prisma = await this.prismaClientManager.getClient(orgId);
    try {
      await this.get(orgId, id);
      await prisma.customField.delete({
        where: {
          id,
        },
      });
      return {
        code: 200,
        success: true,
        message: 'Custom field deleted successfully',
      };
    } catch (error) {
      throw error
    } finally {
      prisma.$disconnect()
      await this.prismaClientManager.disconnectClient(orgId)
    }
  }

  async get(orgId: string, id: string) {
    const prisma = await this.prismaClientManager.getClient(orgId);
    try {
      const customField = await prisma.customField.findUnique({
        where: { id },
      });
      if (!customField) {
        throw new NotFoundException('Custom field not found');
      }
      return customField;
    } catch (error) {
      throw error
    } finally {
      prisma.$disconnect()
      await this.prismaClientManager.disconnectClient(orgId)
    }
  }

  async getAll(orgId: string, customFieldParent: CustomFieldParent) {
    const prisma = await this.prismaClientManager.getClient(orgId);
    try {
      const customFields = await prisma.customField.findMany({
        where: { customFieldParent },
      });
      return customFields;
    } catch (error) {
      throw error
    } finally {
      prisma.$disconnect()
      await this.prismaClientManager.disconnectClient(orgId)
    }
  }

  async getByName(orgId: string, name: string) {
    const prisma = await this.prismaClientManager.getClient(orgId);
    try {
      const key = convertToKey(name);
      const existingField = await prisma.customField.findFirst({
        where: {
          key,
        },
      });
      if (existingField) {
        throw new BadRequestException('Custom field already exists');
      }
      return existingField;
    } catch (error) {
      throw error
    } finally {
      prisma.$disconnect()
      await this.prismaClientManager.disconnectClient(orgId)
    }
  }

  async getTableFields(orgId: string, tableName: string): Promise<string[]> {
    const prisma = await this.prismaClientManager.getClient(orgId);
    try {
      const schemaName = orgId.length > 5 ? getSchemaName(orgId) : orgId;
      const tableMetadata: any[] = await prisma.$queryRaw`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name = ${tableName}
        AND table_schema = ${schemaName};
      `;
      return tableMetadata.map((column) => column.column_name);
    } catch (e) {
      return [];
    } finally {
      prisma.$disconnect()
      await this.prismaClientManager.disconnectClient(orgId)
    }
  }
}
