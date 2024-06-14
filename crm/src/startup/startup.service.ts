import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { AccountsService } from 'src/accounts/accounts.service';
import { DEFAULT_SCHEMA_NAME } from 'src/common/constants/system.constants';
import { WebClientService } from 'src/common/services/web-client.service';
import { ContactsService } from 'src/contacts/contacts.service';
import { OrganizationService } from 'src/microservices/base-services/organization.service';
import { PrismaClientManager } from 'src/prisma/prismaClientManager.service';
import { SchemaManagerService } from 'src/schema-manager/schema-manager.service';

@Injectable()
export class StartupService implements OnModuleInit {
  private logger = new Logger(StartupService.name);

  constructor(
    private readonly prismaClientManager: PrismaClientManager,
    private readonly schemaManager: SchemaManagerService,
    private readonly organizationService: OrganizationService,
    private readonly contactService: ContactsService,
    private readonly accountService: AccountsService,
  ) { }

  onModuleInit() {
    this.executeOnStartup();
  }
  async executeOnStartup() {
    await this.syncOrganizations();
    // await this.schemaMigration();
  }

  async syncOrganizations() {
    try {
      this.logger.log('Syncing organizations...');
      const itemPerPage = 10;
      let _total = 1;
      let _page = Math.ceil(_total / itemPerPage);

      let page = 1;
      while (page <= _page) {
        const response = await this.organizationService.getOrganizations({ page: page, limit: itemPerPage });
        _total = response.total;
        _page = Math.ceil(_total / itemPerPage);
        for (const org of response.data) {
          const rollback = () => { };
          try {
            await this.schemaManager.create(
              org.id,
              rollback,
            );
            this.logger.log(`Organization ${org.name} synced successfully.`);
            await this.syncDataFromCRM(org.id);
          } catch (error) {
            this.logger.warn(error);
          }
        }
        page++;
      }
      this.logger.log('Organizations sync completed successfully.');
      return {
        statusCode: 200
      }
    } catch (error) {
      this.logger.error(`Organization sync failed: ${error}`);
      return {
        statusCode: 500
      }
    }
  }
  async syncSingleOrganization(orgId: string) {
    try {
      this.logger.log(`Syncing organization ${orgId}...`);
      const rollback = () => { };
      await this.schemaManager.create(
        orgId,
        rollback,
      );
      this.logger.log(`Organization ${orgId} synced successfully.`);
      await this.syncDataFromCRM(orgId);
      return {
        statusCode: 200
      }
    } catch (error) {
      this.logger.error(`Organization sync failed: ${error}`);
      return {
        statusCode: 500
      }
    }
  }

  async schemaMigration() {
    const prisma = await this.prismaClientManager.getClient(DEFAULT_SCHEMA_NAME);
    try {
      this.logger.log('Schema migration completed successfully.');
      const orgs = await prisma.info.findMany();
      for (const org of orgs) {
        try {
          await this.schemaManager.applyMigration(org.orgId, null);
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
    } finally {
      await this.prismaClientManager.disconnectClient(DEFAULT_SCHEMA_NAME)
    }
  }

  async syncDataFromCRM(orgId: string) {
    // this.contactService.syncExternalCrmToContacts(orgId);
    this.contactService.syncContactsToExternalCrm(orgId);
    // this.accountService.syncExternalCrmToAccounts(orgId);
    this.accountService.syncAccountsToExternalCrm(orgId);
  }
}
