import { Injectable, OnModuleInit } from '@nestjs/common';
import { LlmService } from 'src/llm/llm.service';
import Redis, { Redis as RedisClient } from 'ioredis';
import { PrismaService } from 'src/prisma/prisma.service';
import { CALENDAR_OBSORVER_PROMPT_TEMPLATE } from 'src/common/templates/calendar-obsorver.template';
import { LLMModels, LLMNames } from 'src/llm/llm.contants';

@Injectable()
export class CalendarObsorverService implements OnModuleInit{
    private redisPublisher: RedisClient;
    private redisSubscriber: RedisClient;

    constructor(
        private readonly llmService: LlmService,
        private readonly prisma: PrismaService
    ){
        this.redisPublisher = new Redis({
            host: process.env.REDIS_IP,
            port: parseInt(process.env.REDIS_PORT, 10) || 6379,
            password: process.env.REDIS_PASSWORD
        });
          this.redisSubscriber = new Redis({
            host: process.env.REDIS_IP,
            port: parseInt(process.env.REDIS_PORT, 10) || 6379,
            password: process.env.REDIS_PASSWORD
        });
  
    }
    onModuleInit() {
        this.redisSubscriber.subscribe('checkcalendar', (err, count) => {
            if (err) {
              console.error('Failed to subscribe: %s', err.message);
            } else {
              console.log(`Subscribed successfully! This client is currently subscribed to ${count} channels.`);
            }
        });

        this.redisSubscriber.on('message', async (channel, message) => {
            try {
                const payload = JSON.parse(message);
                const clientId = payload.clientId;
                const content = payload.content;
                const messages = await this.prisma.zautoMessage.findMany({
                    where: {convId: payload.convId, type: 'TEXT'},
                    take: -2, // Take the last two records
                    orderBy: {
                        createdAt: 'desc' // Assuming 'createdAt' is your date field. Adjust the field name accordingly.
                    }
                }); 
                const result = await this.findSchedule(messages);
                console.log(result)
                let jsonSchedule = undefined;
                if(result.content && result.content.includes('```json')) {
                    jsonSchedule = this.extractJsonFromMarkdown(result.content);
                } else {
                    jsonSchedule = JSON.parse(result.content);
                }
                const resContent = jsonSchedule ? jsonSchedule : { schedule: false};
                if(resContent.schedule)
                    this.redisPublisher.publish('scheduleFound', JSON.stringify({clientId: clientId, content: resContent}));
            }
            catch(error)
            {
                console.log(error);
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

    async findSchedule(messages)
    {
        let prompt = CALENDAR_OBSORVER_PROMPT_TEMPLATE;
        prompt = prompt.replace('{{conversation}}', JSON.stringify(messages));
        const promptMesssage = [
            {role: 'system', content: prompt}
        ];
        return await this.llmService.sendDirect(promptMesssage, LLMNames.COHERE, LLMModels.COHER_COMMAND_R_PLUS);
    }
}