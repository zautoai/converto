import { Injectable } from "@nestjs/common";
import Redis, { Redis as RedisClient } from 'ioredis';
import { SUMMARIZER_PROMPT } from "src/common/templates/summarizer.prompt.template";
import { Sentimental } from "src/conversation/entities/conversation.entity";
import { LlmService } from "src/llm/llm.service";
import { PrismaService } from "src/prisma/prisma.service";


@Injectable()
export class SummarizerService {

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
        this.redisSubscriber.subscribe('updateSummary', (err, count) => {
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
                        messages: {
                            where: { type : 'TEXT'},
                            orderBy: { createdAt: 'asc' }, 
                        }
                    },
                    where: {id}
            });
            if (conversation) {
                const lastMessageOn = conversation.messages[conversation.messages.length - 1]?.modifiedAt.getTime();
                if (!conversation.summaryUpdatedAt || lastMessageOn && lastMessageOn > conversation.summaryUpdatedAt.getTime()) {
                    // const result = await this.getSummary(conversation);
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

    async getSummary(conversation: any) {
        try {
            let summarizerPrompt = SUMMARIZER_PROMPT;
            const customerName = conversation.Lead?.name ? conversation.Lead.name : 'Anonymous Customer';
            const messages = []
            for (let message of conversation.messages) {
                messages.push({
                    role: message.role == 'assistant' ? conversation.agent?.displayName : customerName,
                    content: message.content
                });
            }
            const content = `BDR Name: ${conversation.agent?.name}
            Customer Name: ${customerName}
            Here is the chat conversation:
            ${JSON.stringify(messages)}`;

            const promptMesssage = [
                { role: 'system', content: summarizerPrompt },
                { role: 'user', content: content }
            ];
            //const result = await this.llmService.chat(promptMesssage);
            const result = {
                content: `{
                    "taskList": ['Generate Suggestions'],
                    "summaryList": ['Generate Summary'],
                    "sentimental": "positive",
                    "potentialLevel": "high"
                }`
            };
            let summaryJson = undefined
            if (result.content.includes('```json')) {
                summaryJson = this.extractJsonFromMarkdown(result.content);
            } else {
                summaryJson = JSON.parse(result.content);
            }

            if (summaryJson) {
                let taskList = '';
                if (Array.isArray(summaryJson.taskList)) {
                    for (let [index, task] of summaryJson.taskList.entries()) {
                        if (task.startsWith(`${index + 1}`))
                            taskList += `${task}\n`;
                        else taskList += `${index + 1}. ${task}\n`;
                    }
                } else {
                    taskList = summaryJson.taskList;
                }

                let summaryList = '';

                if (Array.isArray(summaryJson.summary)) {
                    for (let [index, summary] of summaryJson.summary.entries()) {
                        if (summary.startsWith(`${index + 1}`))
                            summaryList += `${summary}\n`;
                        else summaryList += `${index + 1}. ${summary}\n`;
                    }
                } else {
                    summaryList = summaryJson.summary;
                }

                return await this.prisma.conversation.update({
                    where: { id: conversation.id },
                    data: {
                        summary: summaryList,
                        sentimental: Sentimental[summaryJson.sentimental.toUpperCase()],
                        taskList: taskList,
                        potentialLevel: summaryJson.potentialLevel.toUpperCase(),
                        summaryUpdatedAt: new Date()
                    }
                });
            }

        } catch (error) {
            console.log(error)
        }
    }

}