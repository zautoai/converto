import { Injectable } from "@nestjs/common";
import Redis, { Redis as RedisClient } from 'ioredis';
import { STARTER_GENERATOR_PROMPT } from "src/common/templates/starter-generator.template";
import { LLMModels, LLMNames } from "src/llm/llm.contants";
import { LlmService } from "src/llm/llm.service";
import { PrismaService } from "src/prisma/prisma.service";


@Injectable()
export class StarterGeneratorService {

    private redisSubscriber: RedisClient;

    constructor(private readonly llmService: LlmService,
        private readonly prisma: PrismaService) {

        this.redisSubscriber = new Redis({
            host: process.env.REDIS_IP,
            port: parseInt(process.env.REDIS_PORT, 10) || 6379,
            password: process.env.REDIS_PASSWORD
        });

    }

    onModuleInit() {
        this.redisSubscriber.subscribe('generateStarters', (err, count) => {
            if (err) {
                console.error('Failed to subscribe: %s', err.message);
            } else {
                console.log(`Subscribed successfully! This client is currently subscribed to ${count} channels.`);
            }
        });

        // Handle incoming messages
        this.redisSubscriber.on('message', async (channel, message) => {
            const payload = JSON.parse(message);
            const id = payload.convId;
            const conversation = await this.prisma.conversation.findUnique({
                include: {
                    messages: {
                        where: { type: 'TEXT' },
                        orderBy: { createdAt: 'asc' },
                        select: {
                            content: true,
                            role: true
                        },
                    }
                },
                where: { id }
            });
            if (conversation) {
                // const content = JSON.stringify(conversation.messages);
                // const result = await this.generateStarters(content);
                // let jsonLead = undefined;
                // if(result.content && result.content.includes('```json')) {
                // jsonLead = this.extractJsonFromMarkdown(result.content);
                // } else {
                //     jsonLead = JSON.parse(result.content);
                // }
                // console.log(jsonLead);
            }
        });
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

    async generateStarters(content: string) {
        let prompt = STARTER_GENERATOR_PROMPT.replace('{{conversation}}', content);
        const promptMesssage = [
            { role: 'system', content: prompt }
        ];
        return await this.llmService.sendDirect(promptMesssage, LLMNames.COHERE, LLMModels.COHER_COMMAND_R);
    }

}