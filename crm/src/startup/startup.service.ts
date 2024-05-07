import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { API } from 'src/common/configs/zauto.endpoint';
import { DEFAULT_SCHEMA_NAME } from 'src/common/constants/system.constants';
import { WebClientService } from 'src/common/services/web-client.service';
import { OrganizationService } from 'src/microservices/base-services/organization.service';
import { PrismaClientManager } from 'src/prisma/prismaClientManager.service';
import { SchemaManagerService } from 'src/schema-manager/schema-manager.service';

@Injectable()
export class StartupService implements OnModuleInit {
  private logger = new Logger(StartupService.name);

  constructor(
    private readonly prismaClientManager: PrismaClientManager,
    private readonly schemaManager: SchemaManagerService,
    private readonly webClient: WebClientService,
    private readonly organizationService:OrganizationService
  ) {}

  onModuleInit() {
    this.executeOnStartup();
  } 
 
  async executeOnStartup() {
    await this.syncOrganizations(); 
    await this.schemaMigration(); 
  }
 
  async syncOrganizations() {
    try {
      this.logger.log('Syncing organizations...');
      const itemPerPage = 10; 
      let _total = 1;
      let _page = Math.ceil(_total / itemPerPage);

      let page = 1;  
      while (page <= _page) {
        const response = await await this.organizationService.getOrganizations({ page: page, limit: itemPerPage });       
        _total = response.total;
        _page = Math.ceil(_total / itemPerPage);
        for (const org of response.data) {
          const rollback = () => {};
          try {
            await this.schemaManager.create(
              { name: org.name, orgId: org.id }, 
              rollback,
            );
            this.logger.log(`Organization ${org.name} synced successfully.`);
          } catch (error) { 
            this.logger.warn(error);            
          }
        }
        page++;
      }

      this.logger.log('Organizations sync completed successfully.');
    } catch (error) {
      this.logger.error(`Organization sync failed: ${error}`);
    }
  }

  async schemaMigration() {
    try {
      this.logger.log('Schema migration completed successfully.');
      const prisma = await this.prismaClientManager.getClient(DEFAULT_SCHEMA_NAME);
      const orgs = await prisma.info.findMany();
      for (const org of orgs) {
        try {
          await this.schemaManager.applyMigration(org.orgId, true);
          this.logger.log(
            `${org.orgName} schema migration completed successfully.`,
          );
        } catch (error) { 
          this.logger.warn(error);
          console.warn(error);
        }
      }
    } catch (error) {
      this.logger.error(error);
      console.log(error);
      
    }
  }
}
