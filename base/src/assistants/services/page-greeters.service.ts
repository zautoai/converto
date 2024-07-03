import { Injectable } from '@nestjs/common';
import { LlmService } from 'src/llm/llm.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { GREETER_PROPMT } from 'src/common/templates/claude/page-greeter.template';
import { WebScraperService } from 'src/common/services/web-scraper.service';

@Injectable()
export class PageGreeterService {

    constructor(
        private prisma: PrismaService,
        private readonly llmService: LlmService,
        private readonly webscrapper: WebScraperService) { }

    async generateGreeting(agentId: string) {
        const agent = await this.prisma.agent.findUnique({
            where: { id: agentId }, include: {
                AgentFiles: true
            }
        });
        const sites = await this.prisma.site.findMany();
        const pages = [];
        for (let site of sites) {
            pages.push({
                url: site.url,
                content: (await this.webscrapper.getSimpleContent(site.url))?.pageContent
            })
        }
        const greetings = await this.getGreetings(pages);
        return greetings;
    }

    async getGreetings(pages: any[], retry: number = 0) {
        try {
            let greatings = [];
            for (let page of pages) {
                const messages = [
                    { role: 'system', content: GREETER_PROPMT },
                    { role: 'user', content: JSON.stringify(page) }
                ]
                const response = await this.llmService.chat(messages);
                if (!response || !response.content) {
                    if (retry < 1) {
                        return this.getGreetings([page], retry + 1);
                    }
                    throw 'Unable to get the greetings';
                }
                let _jsonstr = response.content;
                if (_jsonstr.includes('```json')) {
                    pages.push(this.extractJsonFromMarkdown(_jsonstr)[0])
                }
                greatings.push(JSON.parse(_jsonstr)[0]);
            }
            return greatings;
        }
        catch (error) {
            console.error(error)
            if (retry < 1) {
                return this.getGreetings(pages, retry + 1);
            }
            throw 'Unable to get the greetings';
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
}