import { Injectable } from "@nestjs/common";
import Redis, { Redis as RedisClient } from 'ioredis';
import { CATEGORISER_PROMPT } from "src/common/templates/categoriser-prompt.template";
import { SUMMARIZER_PROMPT } from "src/common/templates/summarizer.prompt.template";
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
                        Lead: true,
                        visit: true,
                        visitor: true,
                        agent: true,
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

    async updateCategories(conversation: any) {
        try {
            let categoriserPrompt = CATEGORISER_PROMPT;
            const customerName = conversation.Lead?.name ? conversation.Lead.name : 'Anonymous Customer';
            const messages = []
            for(let message of conversation.messages) {
                messages.push({
                    role: message.role == 'assistant' ? conversation.agent.displayName : customerName,
                    content: message.content
                });
            }

            const leadCategories = await this.prisma.leadCategory.findMany({where: {orgId: conversation.orgId}});

            categoriserPrompt = categoriserPrompt.replace('{{conversation}}', JSON.stringify(messages));

            categoriserPrompt = categoriserPrompt.replace('{{categories}}', JSON.stringify(leadCategories))

            let customerDetails = `${JSON.stringify(conversation.visit)}
            ${JSON.stringify(conversation.visitor)} 
            ${JSON.stringify(conversation.Lead)}`;

            categoriserPrompt = categoriserPrompt.replace('{{conversation}}', JSON.stringify(customerDetails))

            const content = `Provide the Categories as comma separated stirng`;

            const promptMesssage = [
                {role: 'system', content: categoriserPrompt},
                {role: 'user', content: content}
            ];
            const result = await this.llmService.chat(promptMesssage);
            
            await this.addLeadCategories(result.content, conversation.id);
            
        } catch(error) {
            console.log(error)
        }
    }

    async addLeadCategories(leadCategoryIds: string, convId: string) {
        const categories = leadCategoryIds.split(',');
        const conv = await this.prisma.conversation.findUnique({where:{id: convId}, include: {Lead: true}});
        const lead = await this.prisma.lead.findUnique({where:{id: conv.Lead.id}});
        if(conv && lead) {
            for(let categoryid of categories) {
                let category = await this.prisma.leadCategory.findUnique({where:{id: categoryid}});
                if(category) {
                    await this.prisma.leadCategoryMap.create({data: {
                        leadId: lead.id, 
                        categoryId: category.id, 
                        orgId: conv.orgId
                    }}); 
                }
            }
        }
    }

}