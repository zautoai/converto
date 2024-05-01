import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CrmKeyMapingService } from './crm-key-maping.service';
import { Client } from '@hubspot/api-client';
import { OauthService } from 'src/oauth/oauth.service';
import { OrgToolService } from 'src/org-tool/org-tool.service';
import { SimplePublicObjectInputForCreate } from '@hubspot/api-client/lib/codegen/crm/contacts';


@Injectable()
export class CrmConnectorService implements OnModuleInit {

    constructor(
        private readonly prisma: PrismaService,
        private readonly keyMappingService: CrmKeyMapingService,
        private readonly oauthService: OauthService,
        private readonly orgToolService: OrgToolService
    ) { }


    async onModuleInit() {
        // await this.pushDataToCRM("411bcd12-b97a-4626-aecc-fed5cfbca121","ca1c9539-6f41-47ce-8dcc-6131e68ecb4e", "hubspot");
    }

    async getDataByKeymapping(convId: string,orgId: string, orgToolId: string) {
        try
        {
            const keyMappings = await this.keyMappingService.findAll(orgId, orgToolId);
            const leadData = await this.prisma.lead.findFirst({ where: { convId: convId } });
            const convoData = await this.prisma.conversation.findFirst({ where: { id: convId }, include:{campaign:true}});
            const visitData = await this.prisma.visit.findFirst({ where: { campaignId: convoData.campaignId },include:{campaign:true} });
            const visitorData = await this.prisma.visitor.findFirst({ where: { id: convoData.visitorId } });
            
            if(leadData.info){
                leadData.info = JSON.parse(leadData.info);
            }
            if(visitorData.trackingInfo){
                visitorData.trackingInfo = JSON.parse(visitorData.trackingInfo);
            }
            const dataObject = {
                lead: leadData,
                conversation: convoData,
                visitor: visitorData,
                visit: visitData
            };        
            const payload = {};
            for (const mapping of keyMappings) {
                const keys = mapping.fieldName.split('.');
                let value = dataObject;
                for (const key of keys) {
                    if (value === null) {
                        continue;
                    }
                    if (value.hasOwnProperty(key)) {
                        value = value[key];
                    } else {
                        value = null;
                        break;
                    }
                }
                if(value)
                {
                    payload[mapping.externalFieldName] = value;
                }
            }
    
            return payload;
        }
        catch(error)
        {
            console.error('Error in getting data from keymap:',error.message);
        }
    }

    async pushDataToCRM(convId: string, toolName: string) {
        try {
            const  conversation = await this.prisma.conversation.findUnique({where:{id: convId}});
            if(conversation)
            {
                const orgId = conversation.orgId;
                const orgTool = await this.orgToolService.findByToolName(toolName, orgId);
        
                if (orgTool) {
                    const payload = await this.getDataByKeymapping(convId, orgId, orgTool.id);
        
                    if (payload) {
                        const tokenData = await this.oauthService.getAccessToken(orgId, toolName);
        
                        if (toolName === 'hubspot') {
                            await this.handleHubSpotData(convId, payload, orgId, tokenData);
                        }
                    }
                }
                else
                {
                    console.error(`Tool not found with name: ${toolName}`);
                }
            }
            else
            {
                console.error('Conversation not found');
            }
        } catch (error) {
            console.error('Error in pushDataToCRM:', error.message);
        }
    }
    
    private async handleHubSpotData(convId: string, payload: any, orgId: string, tokenData: any) {
        const hubspotClient = new Client({
            accessToken: tokenData.accessToken
        });
    
        try {
            const contactObj = new SimplePublicObjectInputForCreate();
            contactObj.properties = payload;
    
            const leadData = await this.prisma.lead.findFirst({ where: { convId } });
    
            if (!leadData || !leadData.crm_id) {
                // If no lead record or crm_id is found, create a new contact in HubSpot
                const response = await hubspotClient.crm.contacts.basicApi.create(contactObj);
                const crm_id = response.id;
    
                // Update lead table with the newly created crm_id
                await this.prisma.lead.upsert({
                    where: { convId },
                    update: { crm_id },
                    create: { convId, crm_id, orgId }
                });
            } else {
                // Update existing contact in HubSpot
                try {
                    await hubspotClient.crm.contacts.basicApi.update(leadData.crm_id, contactObj);
                }
                catch (updateError)
                {
                    if (updateError.code == '404')
                    {
                        const response = await hubspotClient.crm.contacts.basicApi.create(contactObj);
                        const crm_id = response.id;

                        await this.prisma.lead.update({
                            where: { convId },
                            data: { crm_id }
                        });
                    }
                }
            }
        } catch (error) {
            console.error('Error in handleHubSpotData:', error.message);
        }
    }
    
    
    

}