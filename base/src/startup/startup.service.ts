import { Injectable, OnModuleInit } from '@nestjs/common';
import { ZAUTO_ORG } from 'src/common/constants/system.constants';
import { Organization } from 'src/organizations/entities/organization.entity';
import { OrganizationsService } from 'src/organizations/organizations.service';
import { PlatformService } from 'src/platform/platform.service';
import { RolesService } from 'src/roles/roles.service';
import { UsersService } from 'src/users/users.service';
import { ZAUTO_HELPERS } from '../helpers/entities/helpers.model';
import { HelpersService } from 'src/helpers/helpers.service';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { SubscriptionPlanService } from 'src/subscription-plan/subscription-plan.service';
import { CreateSubscriptionPlanDto } from 'src/subscription-plan/dto/create-subscription-plan.dto';
import { DEFAULT_PLANS } from 'src/subscription-plan/entities/default-subscriptions-plans';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateOrgAccountDto } from 'src/account/dto/create-account.dto';
import { OrgAccountStatus } from 'src/common/enums/enums';
import { OrgAccountService } from 'src/account/account.service';
import { providers } from 'src/common/configs/oauth.config';
import { ExternalToolService } from 'src/external-tool/external-tool.service';
import { CreateToolDto } from 'src/external-tool/Dto/create-tool.dto';

@Injectable()
export class StartupService implements OnModuleInit {

    private readonly foldersToCreate = ['uploads', 'public', 'public/images'];

    constructor(
        private prisma: PrismaService,
        private roleService: RolesService,
        private userService: UsersService,
        private orgService: OrganizationsService,
        private platformService: PlatformService,
        private helperService: HelpersService,
        private orgAccountService: OrgAccountService,
        private subscriptionPlan:SubscriptionPlanService,
        private externalToolService: ExternalToolService) { }
        
    async onModuleInit() {
        this.executeOnStartup();
    }

    async executeOnStartup() {
        await this.createSubscriptions();
        await this.createDefaultRoles();
        await this.createZautoOrg()
        await this.createPlatforms();
        //await this.resyncHelpers();
        await this.createFolders();
        await this.createOrUpdateOauthProviders();
    }

    async createDefaultRoles() {
        const defaultRoles = [
            {
                name: 'admin'
            },
            {
                name: 'user'
            },
            {
                name: 'superadmin'
            }
        ];
        try {
            await this.roleService.createDefaultRoles(defaultRoles);
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
            await this.createSuperUser(zautoAI);
        } else {
            throw 'Zauto AI not created.'
        }
    }

    async createSuperUser(zautoAI: Organization) {
        const userName = process.env.SUPER_USER_NAME;
        const email = process.env.SUPER_USER_EMAIL;
        const password = process.env.SUPER_USER_PASSWORD;
        const superUserRole = await this.roleService.findOneByName('superadmin');
        if (superUserRole) {
            const userDeatails = {
                name: userName,
                email: email,
                password: password,
                roleId: superUserRole.id,
                orgId: zautoAI.id,
                verified: true,
            };
            try {
                const selectedPlan = await this.getSubscription("");
                if(selectedPlan)
                {
                    const createOrgAccountDto = new CreateOrgAccountDto();
                    createOrgAccountDto.orgId = userDeatails.orgId;
                    createOrgAccountDto.subscriptionId = selectedPlan.id;
                    createOrgAccountDto.status = (selectedPlan.price == 0) ? OrgAccountStatus.ACTIVE : OrgAccountStatus.PENDING;
                    const orgAccount = await this.orgAccountService.create(createOrgAccountDto);
                    if(orgAccount)
                    {
                        const superUser = await this.userService.create(userDeatails, true);
                        if (superUser) {
                            console.log('Superuser Created.')
                        }
                    }
                    else
                    {
                        console.error('Organization account not created');
                    }
                }
                else
                {
                    console.error("Unable to select subscription plan");
                }
            } catch (exception) {
                console.info('Super Admin not created, mybe it got created already.')
            }
        } else {  
            throw 'Super Admin not created.'
        }
    }

    async getSubscription(subId: string) 
    {
        const subsPlan = await this.prisma.subscriptionPlan.findUnique({where:{id:subId}});
        if(subsPlan)
        {
        return subsPlan;
        }
        else
        {
        const freePlan = await this.prisma.subscriptionPlan.findFirst({where:{price:0}});
        return freePlan;
        }
    }

    //Default Platforms
    async createPlatforms() {
        const defaultPlatforms = [
            {
                name: 'facebook'
            },
            {
                name: 'instagram'
            },
            {
                name: 'whatsapp'
            },
            {
                name: 'twitter'
            },
            {
                name: 'linkedin'
            },
        ];
        try {
            await this.platformService.createDefaultPlatforms(defaultPlatforms);
        } catch (error) {
            console.error('Default platform not created, mybe it got created already.')
        }
    }


    async resyncHelpers() {
        try {
            this.helperService.reSyncHelpers();
        } catch(error) {
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

    async createSubscriptions() {
        const defaultPlans = DEFAULT_PLANS;

        try {
            for (let plan of defaultPlans) {
                const createSubscriptionPlanDto = new CreateSubscriptionPlanDto();
                createSubscriptionPlanDto.name = plan.name;
                createSubscriptionPlanDto.description = plan.description;
                createSubscriptionPlanDto.agentsCount = plan.agentsCount;
                createSubscriptionPlanDto.messageCount = plan.messageCount;
                createSubscriptionPlanDto.sitesCount = plan.sitesCount;
                createSubscriptionPlanDto.campaignCount = plan.campaignCount;
                createSubscriptionPlanDto.userCount = plan.userCount;                
                createSubscriptionPlanDto.price = plan.price;                
                await this.subscriptionPlan.create(createSubscriptionPlanDto)
            }
        } catch (error) {
            console.error('Default subscription plan not created, mybe it got created already.')
        }
    }

    async createOrUpdateOauthProviders() {
        try {
            console.log('ServerStartup: Creating or updating OAuth providers');
            for (let name in providers) {
                let provider = providers[name];
                const externalToolDto = new CreateToolDto();
                externalToolDto.name = name;
                externalToolDto.type = provider.type;
                externalToolDto.authUrl = provider.authUrl;
                externalToolDto.profileUrl = provider.profileUrl;
                externalToolDto.redirectUri = provider.redirectUri;
                externalToolDto.propertyUrl = provider.propertyUrl;
                externalToolDto.tokenUrl = provider.tokenUrl;
                externalToolDto.clientId = provider.clientId;
                externalToolDto.clientSecret = provider.clientSecret;
                externalToolDto.scope = provider.scope.join(' ');
                externalToolDto.level = provider.level;
    
                try {
                    // Check if the provider already exists
                    const existingProvider = await this.externalToolService.getToolByName(name);
                    if (existingProvider) {
                        // Update existing provider
                        await this.externalToolService.update(existingProvider.id, externalToolDto);
                        console.log(`Updated OAuth provider: ${name}`);
                    } else {
                        // Create new provider
                        await this.externalToolService.create(externalToolDto);
                        console.log(`Created OAuth provider: ${name}`);
                    }
                } catch (error) {
                    console.error(`Error creating or updating OAuth provider ${name}: ${error.message}`);
                }
            }
            console.log('ServerStartup: OAuth providers created or updated');
        } catch (error) {
            console.error('ServerStartup: Error creating or updating OAuth providers:', error.message);
        }
    }
    
} 