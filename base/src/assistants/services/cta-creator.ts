import { Injectable, OnModuleInit } from '@nestjs/common';
import e from 'express';
import { WebScraperService } from 'src/common/services/web-scraper.service';
import { CTA_CREATOR_PROMPT } from 'src/common/templates/cta-creator.template';
import { HelperName } from 'src/helpers/entities/helpers.model';
import { LLMModels, LLMNames } from 'src/llm/llm.contants';
import { LlmService } from 'src/llm/llm.service';;
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CTACreatorService implements OnModuleInit {

    constructor(private readonly llmService: LlmService,
        private readonly prisma: PrismaService,
        private readonly webscrapper: WebScraperService) {
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

    onModuleInit() {

    }

    getFieldTitle(field) {
        return field
            .split('_') // Split the string on underscores
            .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize the first letter of each word
            .join(' '); // Join the words with a space
    }

    async createCTAs(agentId: string) {
        const agent = await this.prisma.agent.findUnique({
            where: { id: agentId }
        });

        const sites = await this.getSites(agent.id);
        for (let site of sites) {
            const message = await this.getMessageForCTACreation(agent, [site]);
            console.log(`CTACreator: CTAs are ${message}`)
            const ctaList = await this.getCTAs(message);
            console.log(`CTACreator: CTAs are ${JSON.stringify(ctaList)}`)
            if (ctaList && ctaList.length > 0) {
                for (let cta of ctaList) {
                    try {
                        await this.prisma.callToAction.create({
                            data: {
                                orgId: agent.orgId,
                                agentId: agent.id,
                                name: cta.label,
                                description: cta.text,
                                link: cta.link
                            }
                        })
                    } catch (error) {
                        console.log(error)
                    }
                }
            }
        }
    }

    async generateCTAs(agentId: string) {
        try {
            const agent = await this.prisma.agent.findUnique({
                where: { id: agentId }
            });
            const sites = await this.getSites(agent.id);
            let ctaList = [];
            for (let site of sites) {
                const message = await this.getMessageForCTACreation(agent, [site]);
                console.log(`CTACreator: CTAs are ${message}`)
                ctaList = ctaList.concat(await this.getCTAs(message));
            }
            return ctaList;
        } catch (error) {
            console.log(error)
        }
    }

    async getMessageForCTACreation(agent: any, sites: any[]) {
        return `${JSON.stringify(sites)}`;
    }

    async getSites(agentId: string) {
        const sites = await this.prisma.site.findMany()
        let _sites = [];
        for (let site of sites) {
            _sites.push({
                id: site.id,
                url: site.url,
                contnet: (await this.webscrapper.getSimpleContent(site.url))?.pageContent
            })
        }
        return _sites;
    }

    async getCTAs(message: string, retry: number = 0) {
        try {
            const systemPrompt = CTA_CREATOR_PROMPT.replace("{{context}}", message)
            const messages = [
                { role: 'system', content: systemPrompt },
                // {role: 'user', content: 'Provide CTA for the Given Webpage'}
            ];
            // const response = await this.llmService.chat(messages);
            const response = await this.llmService.sendDirect(messages, LLMNames.COHERE, LLMModels.COHER_COMMAND_R_PLUS);
            if (!response || !response.content) {
                if (retry < 1) {
                    return await this.getCTAs(message, retry + 1);
                }
                throw 'Unable to get the instruction';
            }
            let _jsonstr = response.content;
            if (_jsonstr.includes('```json')) {
                return this.extractJsonFromMarkdown(_jsonstr)
            }
            return JSON.parse(_jsonstr);
        } catch (error) {
            console.log(error)
        }
    }
}
