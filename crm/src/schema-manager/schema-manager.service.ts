import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Sql, raw } from '@prisma/client/runtime/library';
import * as fs from 'fs';
import { DEFAULT_SCHEMA_NAME } from 'src/common/constants/system.constants';
import { getSchemaName } from 'src/common/utils/cast.helper';
import { PrismaClientManager } from 'src/prisma/prismaClientManager.service';

@Injectable()
export class SchemaManagerService {

  private readonly migrationBasePath = './prisma/sql';
  private readonly logger = new Logger(SchemaManagerService.name);

  constructor(private readonly prismaClientManager: PrismaClientManager) { }

  async create(orgId: string, rollback: Function): Promise<any> {
    const prisma = await this.prismaClientManager.getClient(DEFAULT_SCHEMA_NAME);
    const schemaName = getSchemaName(orgId);

    try {
      const query: Sql = Prisma.sql`CREATE SCHEMA IF NOT EXISTS ${raw(schemaName)};`;
      await prisma.$executeRaw(query);

      try {
        await this.applyMigration(orgId, rollback);
      } catch (error) {
        console.error('Error applying migration:', error);
      }

      return {
        code: 200,
        success: true,
        message: 'Tenant schema created successfully',
      };
    } catch (error) {
      rollback();
      throw error;
    } finally {
      await this.prismaClientManager.disconnectClient(orgId);
    }
  }

  async migrate(orgId: string): Promise<any> {
    const prisma = await this.prismaClientManager.getClient(orgId);

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
    } finally {
      await this.prismaClientManager.disconnectClient(orgId);
    }
  }

  async delete(orgId: string): Promise<void> {
    const prisma = await this.prismaClientManager.getClient(DEFAULT_SCHEMA_NAME);
    const schemaName = getSchemaName(orgId);

    try {
      const query: Sql = Prisma.sql`DROP SCHEMA IF EXISTS ${raw(schemaName)} CASCADE;`;
      await prisma.$executeRaw(query);
    } catch (error) {
      console.error('Error deleting tenant schema:', error);
      throw error;
    } finally {
      await this.prismaClientManager.disconnectClient(orgId);
    }
  }

  async applyMigration(orgId: string, rollback?: Function) {
    const schemaName = getSchemaName(orgId);
    const prisma = await this.prismaClientManager.getClient(orgId);

    try {
      await prisma.$executeRaw(
        Prisma.sql`SET search_path TO ${raw(schemaName)}`,
      );
      this.logger.debug('Applying migrations for tenant:', orgId);
      const migrationFiles = this.getMigrationFiles(this.migrationBasePath);

      for (const migrationFile of migrationFiles) {
        const migrationFilePath = `${this.migrationBasePath}/${migrationFile}`;
        const migrationSQL = fs.readFileSync(migrationFilePath, 'utf8');
        const sqls = this.processMigrationSQL(migrationSQL);

        for (let statement of sqls) {
          if (statement.trim() === '') {
            continue;
          }
          try {
            const query: Sql = Prisma.sql`${raw(statement)}`;
            await prisma.$executeRaw(query);
          }
          catch (error) {
            // this.logger.error('Error executing migration statement:', error.message);
          }
        }
        this.logger.debug('Migration applied:', migrationFile);
      }
      this.logger.debug('All migrations applied for tenant:', orgId);
    } catch (error) {
      if (rollback) {
        rollback();
      }
      console.error('Error applying migrations for tenant:', error);
      throw error;
    } finally {
      await this.prismaClientManager.disconnectClient(orgId);
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

  processMigrationSQL(migrationSQL: string) {
    return migrationSQL
      .split('\n')
      .filter((line) => !line.startsWith('--'))
      .join('\n')
      .replace(/(\r\n|\n|\r)/gm, ' ')
      .replace(/\s+/g, ' ')
      .split(';');
  }
}
