import { BadRequestException, Injectable } from '@nestjs/common';
import { Sql, raw } from '@prisma/client/runtime/library';
import * as fs from 'fs';
import { getSchemaName } from 'src/common/utils/cast.helper';
import { DEFAULT_SCHEMA_NAME } from 'src/common/constants/system.constants';
import { PrismaClientManager } from 'src/prisma/prismaClientManager.service';
import { Prisma } from '@prisma/client';
import { CreateSchemaManagerDto } from './dto/create-schema-manager.dto';

@Injectable()
export class SchemaManagerService {
  constructor(private readonly prismaClientManager: PrismaClientManager) {}

  async create(
    createSchemaManagerDto: CreateSchemaManagerDto,
    rollback: Function,
  ): Promise<any> {
    const { name, orgId } = createSchemaManagerDto;

    const prisma =
      await this.prismaClientManager.getClient(DEFAULT_SCHEMA_NAME);

    const schemaName = getSchemaName(orgId);
    try {
      const query: Sql = Prisma.sql`CREATE SCHEMA IF NOT EXISTS ${raw(schemaName)};`;
      await prisma.$executeRaw(query);
      try {
        await this.applyMigration(orgId, false, rollback);
      } catch (error) {
        console.error('Error applying migration:', error);
      }
      const existingOrgInfo = await prisma.info.findFirst({
        where: {
          orgId,
        },
      });
      if (!existingOrgInfo) {
        const orgInfo = await prisma.info.create({
          data: {
            orgId,
            orgName: name,
          },
        });
      }
      return {
        code: 200,
        success: true,
        message: 'Tenant schema created successfully',
      };
    } catch (error) {
      rollback();
      throw error;
    }
  }

  async migrate(orgId: string): Promise<any> {
    try {
      await this.applyMigration(orgId);
      return {
        code: 200,
        success: true,
        message: 'Tenant schema migrated successfully',
      };
    } catch (error) {
      console.error('Error migrating tenant schema:', error);
      throw error;
    }
  }

  async delete(orgId: string): Promise<void> {
    try {
      const prisma =
        await this.prismaClientManager.getClient(DEFAULT_SCHEMA_NAME);
      const existingOrgInfo = await prisma.info.findFirst({
        where: {
          orgId,
        },
      });
      if (!existingOrgInfo) {
        throw new Error('Tenant schema does not exist');
      }
      const schemaName = getSchemaName(orgId);
      const query: Sql = Prisma.sql`DROP SCHEMA IF EXISTS ${raw(schemaName)} CASCADE;`;
      await prisma.$executeRaw(query);
      await prisma.info.delete({ where: { orgId } });
    } catch (error) {
      console.error('Error deleting tenant schema:', error);
      throw error;
    }
  }

  async applyMigration(
    orgId: string,
    init: boolean = false,
    rollback?: Function,
  ) {
    try {
      const schemaName = getSchemaName(orgId);
      const migrationBasePath = 'prisma/migrations';
      const migrationFolders = this.getMigrationFolders(migrationBasePath);

      const prisma = await this.prismaClientManager.getClient(orgId);
      await prisma.$executeRaw(
        Prisma.sql`SET search_path TO ${raw(schemaName)}`,
      );

      for (const migrationFolder of migrationFolders) {
        if (init && migrationFolder.includes('init')) continue;
        const migrationFolderPath = migrationBasePath + '/' + migrationFolder;
        const migrationFiles = this.getMigrationFiles(migrationFolderPath);
        for (const migrationFile of migrationFiles) {
          const migrationFilePath = migrationFolderPath + '/' + migrationFile;
          const migrationSQL = fs.readFileSync(migrationFilePath, 'utf8');
          const sqlStatements = migrationSQL
            .split(';')
            .filter((statement) => statement.trim() !== '');

          for (const statement of sqlStatements) {
            const query: Sql = Prisma.sql`${raw(statement)}`;
            try {
              await prisma.$executeRaw(query);
            } catch (error) {
              // console.error('Error applying migration:');
            }
          }
        }
      }
    } catch (error) {
      if (rollback) {
        rollback();
      }
      if (!init) {
        this.delete(orgId);
      }
      console.error('Error applying migrations for tenant:', error);
      throw error;
    }
  }

  getMigrationFolders(migrationBasePath: string) {
    try {
      const migrationFolders = fs
        .readdirSync(migrationBasePath, { withFileTypes: true })
        .filter((dirent) => dirent.isDirectory())
        .map((dirent) => dirent.name);
      return migrationFolders;
    } catch (error) {
      console.error('Error reading migration folders:', error);
      return [];
    }
  }

  getMigrationFiles(migrationFolderPath: string) {
    try {
      const migrationFiles = fs.readdirSync(migrationFolderPath);
      return migrationFiles;
    } catch (error) {
      console.error('Error reading migration files:', error);
      throw error;
    }
  }
}
