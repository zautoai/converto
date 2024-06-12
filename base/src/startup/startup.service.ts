import { Injectable, OnModuleInit } from '@nestjs/common';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { DEFALT_ROLES, ZAUTO_ORG } from 'src/common/constants/system.constants';
import { BaseService } from 'src/common/services/base.service';
import { HelpersService } from 'src/helpers/helpers.service';
import { Organization } from 'src/organizations/entities/organization.entity';
import { OrganizationsService } from 'src/organizations/organizations.service';
import { RolesService } from 'src/roles/roles.service';
import { SchemaManager } from 'src/schema-manager/schema-manager.service';
import { UsersService } from 'src/users/users.service';
import { ZAUTO_HELPERS } from '../helpers/entities/helpers.model';
import { StartupMicroService } from './../microservices/crm_service/startup.service';

@Injectable()
export class StartupService extends BaseService implements OnModuleInit {

    private readonly foldersToCreate = ['uploads', 'public', 'public/images'];

    constructor(
        private schemaManager: SchemaManager,
        private roleService: RolesService,
        private userService: UsersService,
        private orgService: OrganizationsService,
        private helperService: HelpersService,
        private startupMicroService: StartupMicroService,

    ) {
        super();
    }

    async onModuleInit() {
        this.executeOnStartup();
    }

    async executeOnStartup() {
        await this.applieMigration();
        await this.createZautoOrg()
        // await this.createDefaultRoles();
        //await this.resyncHelpers();
        await this.createFolders();
        await this.handleException(await this.startupMicroService.syncOrganizations())
    }

    async applieMigration() {
        try {
            const prisma = await this.getPrismaMasterClient();
            const organizations = await prisma.organization.findMany();
            for (const org of organizations) {
                await this.schemaManager.applyMigration(org.id, null);
            }
        }
        catch (err) {
            console.log(err);
        }
        finally {
            this.closeMasterConnection();
        }
    }

    async createDefaultRoles(orgId: string) {
        const defaultRoles = DEFALT_ROLES;
        try {
            await this.roleService.createDefaultRoles(orgId, defaultRoles);
        } catch (error) {
            console.error('Defailt role not created, mybe it got created already.')
        }
    }

    async createZautoOrg() {
        let zautoAI = await this.orgService.findOneByName(ZAUTO_ORG);
        if (!zautoAI) {
            zautoAI = await this.orgService.create({
                name: ZAUTO_ORG,
            })
        }
        if (zautoAI) {
            await this.createDefaultRoles(zautoAI.id);
            await this.createSuperUser(zautoAI);
        } else {
            throw 'Zauto AI not created.'
        }
    }

    async createSuperUser(zautoAI: Organization) {
        const userName = process.env.SUPER_USER_NAME;
        const email = process.env.SUPER_USER_EMAIL;
        const password = process.env.SUPER_USER_PASSWORD;
        const superUserRole = await this.roleService.findOneByName(zautoAI.id, 'superadmin');
        if (superUserRole) {
            const userDeatails = {
                name: userName,
                email: email,
                password: password,
                orgId: zautoAI.id,
                roleId: superUserRole.id,
                verified: true,
            };
            try {
                const superUser = await this.userService.create(zautoAI.id, userDeatails, true);
                if (superUser) {
                    await this.orgService.update(zautoAI.id, {
                        emails: [superUser.email]
                    })
                    console.log('Superuser Created.');
                }
                // const selectedPlan = await this.getSubscription("");
                // if (selectedPlan) {
                //     const createOrgAccountDto = new CreateOrgAccountDto();
                //     createOrgAccountDto.orgId = userDeatails.orgId;
                //     createOrgAccountDto.subscriptionId = selectedPlan.id;
                //     createOrgAccountDto.status = (selectedPlan.price == 0) ? OrgAccountStatus.ACTIVE : OrgAccountStatus.PENDING;
                //     const orgAccount = await this.orgAccountService.create(createOrgAccountDto);
                //     const superUser = await this.userService.create(zautoAI.id,userDeatails, true);
                //     if (superUser) {
                //         console.log('Superuser Created.')
                //     }
                //     if (orgAccount) {
                //     }
                //     else {
                //         console.error('Organization account not created');
                //     }
                // }
                // else {
                //     console.error("Unable to select subscription plan");
                // }
            } catch (exception) {
                console.info('Super Admin not created, mybe it got created already.')
            }
        } else {
            throw 'Super Admin not created.'
        }
    }

    async resyncHelpers() {
        try {
            this.helperService.reSyncHelpers();
        } catch (error) {
            console.log(error)
        }
    }

    async createHelpers() {
        try {
            console.log('ServerStartup: Creating helpers')
            const helpers = ZAUTO_HELPERS;

            for (let helper of helpers) {
                let _helper = await this.helperService.findByName(helper.name);

                if (_helper) {
                    await this.helperService.remove(_helper.id, _helper.assistantId);
                    console.log('ServerStartup: Helper ' + _helper.name + ' Deleted')
                }

                console.log('ServerStartup: Creating Helper ')
                _helper = await this.helperService.createHelper(helper);
                console.log('ServerStartup: Helper ' + _helper.name + ' created.', _helper.assistantId)

                console.log('ServerStartup: helper ' + _helper.name + ' already created.')
            }
        } catch (error) {
            console.error(error);
        }
    }

    private createFolders() {
        this.foldersToCreate.forEach(folder => {
            const path = join(process.cwd(), folder);
            if (!existsSync(path)) {
                mkdirSync(path, { recursive: true });
                console.log(`Created folder: ${path}`);
            }
        });
    }


} 