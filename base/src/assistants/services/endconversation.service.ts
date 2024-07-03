import { Injectable } from "@nestjs/common";
import Redis, { Redis as RedisClient } from 'ioredis';
import { CATEGORISER_PROMPT } from "src/common/templates/claude/categoriser-prompt.template";
import { SUMMARIZER_PROMPT } from "src/common/templates/claude/summarizer.prompt.template";
import { Sentimental } from "src/conversation/entities/conversation.entity";
import { LlmService } from "src/llm/llm.service";
import { PrismaService } from "src/prisma/prisma.service";


@Injectable()
export class EndOfConversationService {

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
        this.redisSubscriber.subscribe('endOfConversation', (err, count) => {
            if (err) {
                console.error('Failed to subscribe: %s', err.message);
            } else {
                console.log(`Subscribed successfully! This client is currently subscribed to ${count} channels.`);
            }
        });

        // Handle incoming messages
        this.redisSubscriber.on('message', async (channel, message) => {
            const payload = JSON.parse(message);
            const id = payload.id;
            const conversation = await this.prisma.conversation.findUnique({
                include: {
                    visit: true,
                    visitor: true,
                    messages: {
                        where: { type: 'TEXT' },
                        orderBy: { createdAt: 'asc' },
                    }
                },
                where: { id }
            });
            if (conversation) {
                const lastMessageOn = conversation.messages[conversation.messages.length - 1]?.modifiedAt.getTime();
                if (!conversation.summaryUpdatedAt || lastMessageOn && lastMessageOn > conversation.summaryUpdatedAt.getTime()) {
                    //const result = await this.updateCategories(conversation);
                }
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



}