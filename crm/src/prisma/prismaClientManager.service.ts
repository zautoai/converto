import {
  BadRequestException,
  Injectable,
  Logger,
  OnModuleDestroy,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { DEFAULT_SCHEMA_NAME } from 'src/common/constants/system.constants';
import { getSchemaName } from 'src/common/utils/cast.helper';

@Injectable()
export class PrismaClientManager implements OnModuleDestroy {
  private logger = new Logger(PrismaClientManager.name);
  private clients: { [key: string]: PrismaClient } = {};

  async getClient(orgId: string): Promise<PrismaClient> {
    const schemaName = orgId != DEFAULT_SCHEMA_NAME ? getSchemaName(orgId) : DEFAULT_SCHEMA_NAME;
    let client = this.clients[orgId];
    const databaseUrl = process.env.DATABASE_URL.replaceAll(
      DEFAULT_SCHEMA_NAME,
      schemaName,
    );
    if (!client) {
      client = new PrismaClient({
        datasources: {
          db: {
            url: databaseUrl,
          },
        },
      });
      try {
        await client.$connect();
        this.logger.log(`#Connected to schema '${schemaName}'`);
      } catch (error) {
        this.logger.error(`Failed to connect to schema '${schemaName}'`);
        throw new BadRequestException(
          `Failed to connect schema '${schemaName}'`,
        );
      }
      const schemaExists = await this.checkSchemaExists(client, schemaName);
      if (!schemaExists) {
        throw new BadRequestException(`Schema does not exist`);
      }
      this.clients[orgId] = client;
    }

    return client;
  }

  async checkSchemaExists(
    client: PrismaClient,
    schemaName: string,
  ): Promise<boolean> {
    const result = await client.$queryRaw`
            SELECT EXISTS (
                SELECT 1
                FROM information_schema.schemata
                WHERE schema_name = ${schemaName}
            ) as "exists"
        `;
    return result[0].exists;
  }

  async onModuleDestroy() {
    await Promise.all(
      Object.values(this.clients).map((client) => client.$disconnect()),
    );
  }
}
