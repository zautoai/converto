import { Injectable } from '@nestjs/common';
import { ServiceParams } from 'src/common/models/service-param.model';
import { BaseService } from 'src/common/services/base.service';
import { WebScraperService } from 'src/common/services/web-scraper.service';
import { CTA_CREATOR_PROMPT } from 'src/common/templates/cta-creator.template';
import { LLMModels, LLMNames } from 'src/llm/llm.contants';
import { LlmService } from 'src/llm/llm.service';
;

@Injectable()
export class CTACreatorService extends BaseService {

    constructor(private readonly llmService: LlmService,
        private readonly webscrapper: WebScraperService) {
        super()
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



    getFieldTitle(field) {
        return field
            .split('_') // Split the string on underscores
            .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize the first letter of each word
            .join(' '); // Join the words with a space
    }

    async createCTAs(orgId: string) {
        const prisma = await this.getPrismaClient(orgId);

        const sites = await this.getSites(orgId);
        for (let site of sites) {
            const message = await this.getMessageForCTACreation([site]);
            console.log(`CTACreator: CTAs are ${message}`)
            const ctaList = await this.getCTAs(message);
            console.log(`CTACreator: CTAs are ${JSON.stringify(ctaList)}`)
            if (ctaList && ctaList.length > 0) {
                for (let cta of ctaList) {
                    try {
                        await prisma.callToAction.create({
                            data: {
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

    async generateCTAs(orgId: string) {
        try {
            const sites = await this.getSites(orgId);
            let ctaList = [];
            for (let site of sites) {
                const message = await this.getMessageForCTACreation([site]);
                console.log(`CTACreator: CTAs are ${message}`)
                ctaList = ctaList.concat(await this.getCTAs(message));
            }
            return ctaList;
        } catch (error) {
            console.log(error)
        }
    }

    async getMessageForCTACreation(sites: any[]) {
        return `${JSON.stringify(sites)}`;
    }

    async getSites(orgId: string) {
        const prisma = await this.getPrismaClient(orgId);
        const sites = await prisma.site.findMany()
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
