import { Injectable } from "@nestjs/common";
import { AgentService } from "src/agent/agent.service";
import { CreateAvatarDto } from "./dto/create-avatar.dto";
import { FileUtilService } from "src/common/services/file-utility.service";
import { Organization } from "src/organizations/entities/organization.entity";
import { SYSTEM_CONST } from "src/common/constants/system.constants";
import { S3Service } from "src/common/services/s3.service";
import { LlmService } from "src/llm/llm.service";
import { ConversationType, SiteProcessStatus } from "src/common/enums/enums";
import { WebScraperService } from "src/common/services/web-scraper.service";
import { HelpersService } from "src/helpers/helpers.service";
import { io, Socket } from 'socket.io-client'
import { Agent, AgentStatus } from "./entities/agent.entity";
import { PrismaService } from "src/prisma/prisma.service";
import Redis, { Redis as RedisClient } from 'ioredis';
import { PageGreeterService } from "src/assistants/services/page-greeters.service";
import { CTACreatorService } from "src/assistants/services/cta-creator";
import { SiteService } from "src/site/site.service";
import { AVATAR_HELPER_PROMPT } from "src/common/templates/agent-prompt.template";
import { ChromaDBService } from "src/chroma/chroma-dbservice/chroma-db.service";


class Page {
    pageContent: string;
    title: string;
    url: string;
    published: number;
}

class SiteData {
    url: string;
    content: Page;
}

@Injectable()
export class AvatarCreatorService {

    private socketClient: Socket;

    private redisPublisher: RedisClient;

    constructor(private agentService: AgentService, 
        private webScraper: WebScraperService,
        private fileService: FileUtilService,
        private s3Service: S3Service,
        private llmService: LlmService,
        private helperService: HelpersService,
        private pageGreeterService: PageGreeterService,
        private ctaCreatorService: CTACreatorService,
        private prisma: PrismaService,
        private siteService: SiteService,
        private chroma: ChromaDBService) {
            this.socketClient = io(process.env.HOST_URL);
            this.redisPublisher = new Redis({
                host: process.env.REDIS_IP,
                port: parseInt(process.env.REDIS_PORT, 10) || 6379,
                password: process.env.REDIS_PASSWORD
            });
        }

    async createAvatar(avatarId: string, createAvatarDto: CreateAvatarDto, org: Organization) {
        let fileRollBack : Function  = null
        
        try {
            const _avatar = await this.agentService.findOne(avatarId);
            if(_avatar && _avatar.status !== AgentStatus.ACTIVE) {
                console.log('AvatarCreator: Start Creating Avatar for ' + JSON.stringify(createAvatarDto));
                const avatarUniqueName = `${org.name.replaceAll(' ', '_').toLowerCase()}_${createAvatarDto.displayName.replaceAll(' ', '_').toLowerCase()}`;
                this.emitEvent(avatarId, {
                    avatarId: avatarId,
                    status: AgentStatus.TRAINING,
                    message: 'Started Training',
                    name: avatarUniqueName,
                });
                console.log('AvatarCreator: Avatar Unique Name: ' + avatarUniqueName);
                console.log('AvatarCreator: Getting all Links')
                
                const links = await this.getAllLinks(createAvatarDto.companySite);
                
                console.log('AvatarCreator: Got ' + links.length + ' Sites for ' + avatarUniqueName);
                const sites = await this.getContentFromSites(links);
                console.log('AvatarCreator: Got ' + sites.length + ' Sites are processed for ' + avatarUniqueName);

                if(sites.length < 1) {
                    throw 'Unable to Read the Site'
                }
                await this.siteService.trainAvatar(_avatar.orgId, {urls:links, agentId: _avatar.id});
                this.emitEvent(avatarId, {
                    avatarId: avatarId,
                    status: AgentStatus.TRAINING,
                    message: `${sites.length} pages are in training`,
                    name: avatarUniqueName,
                });
                const fileResp = await this.uploadFile(sites, avatarUniqueName);
                const file = fileResp.file;
                fileRollBack = fileResp.rollBack;

                console.log('AvatarCreator: File Uploaded for ' + avatarUniqueName);
                this.emitEvent(avatarId, {
                    avatarId: avatarId,
                    status: AgentStatus.TRAINING,
                    message: `Training Data uploaded to Avatar`,
                    name: avatarUniqueName,
                });
                const instructions = await this.getInstructionsFromHelper(_avatar.name, org.name);
                console.log('AvatarCreator: Instructions  for ' + avatarUniqueName, instructions);
                this.emitEvent(avatarId, {
                    avatarId: avatarId,
                    status: AgentStatus.TRAINING,
                    message: `Instructions Prepared for your Avatar`,
                    instructions: instructions,
                    name: avatarUniqueName,
                });
                const createAgentObj = await this.getCreateAgentObj(createAvatarDto, org, file, instructions);
                console.log('AvatarCreator: Got createAgentObj for ' + avatarUniqueName, createAgentObj);
                
                const agent = await this.agentService.updateAvatar(avatarId, createAgentObj);
                if(!agent) return null;
                console.log('AvatarCreator: Agent Created for ' + avatarUniqueName, agent.id);
                this.emitEvent(avatarId, {
                    avatarId: avatarId,
                    status: AgentStatus.ACTIVE,
                    message: `Avatar is ready`,
                    name: avatarUniqueName,
                });
                
                //await this.addAllSites(agent, sites);
                console.log('AvatarCreator: updating sites greetings');
                await this.updateGreetingsForAllSites(agent,links);
                await this.addCTAs(agent);
                await this.fileService.deleteFile(fileResp.filePath);
                return agent;
            } else {
                this.emitEvent(avatarId, {
                    avatarId: avatarId,
                    status: AgentStatus.ACTIVE,
                    message: 'Avatar is ready to deploy.'
                }); 
            }
        } catch(error) {
            if(fileRollBack) fileRollBack();
            this.agentService.updateStatus(avatarId,AgentStatus.TRAININGFAILED)
            this.emitEvent(avatarId, {
                avatarId: avatarId,
                status: AgentStatus.TRAININGFAILED,
                message: 'Training Failed',
                error: error
            });
            console.log(error)
            throw error;
        }
    }

    async getCreateAgentObj(createAvatarDto: CreateAvatarDto, 
        org: Organization,
        fileObj: any,
        instructions: any) {
            
        const obj = {
            orgId: org.id,
            name: createAvatarDto.displayName.replaceAll(" ", "_").toLowerCase(),
            companyName: createAvatarDto.companyName,
            displayName: createAvatarDto.displayName,
            role: 'Sales Development Representative',
            purpouse: instructions.toValidateProspect,
            leadInfo: instructions.prospectInfo,
            companyBusiness: instructions.companyBusiness, 
            companyValue: instructions.companyValue,
            usetools: true,
            conversationType: ConversationType.CHAT,
            siteObjUrl: fileObj.Location,
            useAssistant: false
        }
        return obj;
    
    }
    

    async getAllLinks(baseUrl: string) {
        const links = this.webScraper.getLinks(baseUrl);
        return links;
    }

    async getContentFromSites(urls: string[]) {
        const sites: SiteData[] = []
        for(let url of urls) {
            const content = await this.webScraper.getSimpleContent(url)
            sites.push({
                url, content
            });
        }
        return sites;
    }

    async uploadFile(sites: any[], avatarUniqueName: string) {
        const filePath = `./${SYSTEM_CONST.TRAINING_CONTENT_PATH}/avatar_${avatarUniqueName}.txt`;
        const fileuploadRollback = () => {
            this.fileService.deleteFile(filePath);
            this.s3Service.deleteFile(filePath);
        };
        try {
            
            const siteContent = JSON.stringify(sites);
            this.fileService.createOrAppendFile(filePath, siteContent);

            const s3Response = await this.s3Service.uploadTextFile(filePath);
            if(!s3Response || !s3Response.Location) throw 'File not uplaoded to s3.';

            //this.fileService.deleteFile(filePath);
            return {
                file: s3Response,
                filePath: filePath,
                rollBack: fileuploadRollback
            }
        } catch(error) {
            fileuploadRollback();
            console.log('AvatarCreator: Failed at uploadFile', error);
            console.log('AvatarCreator: Rolling Back the changes');
            error.callback = fileuploadRollback;
            throw error;
        }
    }

    extractJsonFromMarkdown(mdContent: string) {
        // Regular expression to match a JSON block within Markdown
        const jsonRegex = /```json([\s\S]*?)```/;
    
        // Extract JSON string
        const match = mdContent.match(jsonRegex);
        
        if (match && match[1]) {
            // Clean up whitespace and parse JSON
            try {
                const jsonString = match[1].trim();
                return JSON.parse(jsonString);
            } catch (e) {
                console.error('Failed to parse JSON:', e);
                return null;
            }
        } else {
            console.error('No JSON content found');
            return null;
        }
    }

    async getCompanyDetails(agentName: string, companyName: string) {
        const companyBusiness = await this.chroma.queryDocs(agentName, `What are the ${companyName} Business`);
        const companyValues = await this.chroma.queryDocs(agentName, `What are the ${companyName} values`);
        const docs = companyBusiness.documents.concat(companyValues.documents);
        return docs;
    }

    async getAvatarInstructions(agentName: string, companyName: string, retry: number = 0) {
        try {
            const companyDetails = await this.getCompanyDetails(agentName, companyName);
            let systemPrompt = AVATAR_HELPER_PROMPT;
            systemPrompt = systemPrompt.replace("{{context}}", companyDetails.join(','));
            const zautoMessages = [
                {role: 'system', content: systemPrompt},
                {role: 'user', content: 'Provide requiered details as Plain JSON'},
            ]
            const response = await this.llmService.chat(zautoMessages);
            if(!response || !response.content) {
                if(retry < 1) {
                    return this.getAvatarInstructions(agentName, companyName, retry + 1);
                }
                throw 'Unable to get the instruction';
            }
            let _jsonstr = response.content;
            if(_jsonstr.includes('```json')) {
                return this.extractJsonFromMarkdown(_jsonstr)
            }
            return JSON.parse(_jsonstr);
        } catch(error) {
            console.error(error)
            if(retry < 1) {
                return this.getAvatarInstructions(agentName, companyName, retry + 1);
            }
            throw 'Unable to get the instruction';
        }
    }

    async getInstructionsFromHelper(name: string, companyName: string, rollBack?: Function) {
        const instructions = await this.getAvatarInstructions(name, companyName);
        if(instructions) {
            return instructions;
        } else {
            console.log('AvatarCreator: Failed at getInstructionsFromHelper')
            console.log('AvatarCreator: Rolling Back the changes');
            rollBack();
            throw 'Unable to get the instruction';
        }
    }

    emitEvent(id: string, data: any) {
        const eventName = `avatarStatusUpdate`;
        //this.socketClient.emit(eventName, data);
        this.redisPublisher.publish(eventName, JSON.stringify(data));
        console.log('AvatarCreator: Emitting Event', id, data);
    }


    async addAllSites(avatar: Agent, sites: any[]) {
        try {
            const siteDtos = [];
            for(let site of sites) {
                siteDtos.push({
                    url: site.url,
                    orgId: avatar.orgId,
                    agentId: avatar.id,
                    status: SiteProcessStatus.COMPLETED,
                })
            }
            const result = await this.prisma.site.createMany({data: siteDtos});
        } catch(error) {
            console.log(error)
        }
    }

    async addCTAs(agent: Agent) {
        console.log("CTA Creator Called.")
        try {
            await this.ctaCreatorService.createCTAs(agent.id)
        } catch(error) {
            console.log(error)
        }
    }

    async updateGreetingsForAllSites(avatar: Agent,links: string[])
    {
        try{

            const greetings = await this.pageGreeterService.getGreetings(links);
            if(greetings.length == 0) 
            {
                console.log("Unable to get the greetings");
                return;
            }
            console.log('AvatarCreator: greetings for ',greetings);
            const sites = await this.prisma.site.findMany({where:{agentId: avatar.id}});
            for(let greating of greetings)
            {
                try {
                    await this.prisma.site.updateMany({where:{
                        url: greating.url, 
                        status: SiteProcessStatus.COMPLETED
                    }, data: {greeting: greating.message}});
                } catch(error) {
                    console.log(error);
                }
            }
        }
        catch(error)
        {
            console.log(error);
        }
    }
}