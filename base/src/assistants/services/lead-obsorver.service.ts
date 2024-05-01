import { Injectable, OnModuleInit } from '@nestjs/common';
import { LlmService } from 'src/llm/llm.service';
import { LEAD_OBSORVER_PROMPT_TEMPLATE } from 'src/llm/prompts.template';
import Redis, { Redis as RedisClient } from 'ioredis';
import { PrismaService } from 'src/prisma/prisma.service';
import { LLMModels, LLMNames } from 'src/llm/llm.contants';

@Injectable()
export class LeadObsorverService implements OnModuleInit{

    private redisPublisher: RedisClient;
    private redisSubscriber: RedisClient;

    constructor(private readonly llmService: LlmService,
      private readonly prisma: PrismaService) {

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

        this.redisSubscriber.subscribe('checklead', (err, count) => {
            if (err) {
              console.error('Failed to subscribe: %s', err.message);
            } else {
              console.log(`Subscribed successfully! This client is currently subscribed to ${count} channels.`);
            }
          });
      
          // Handle incoming messages
          this.redisSubscriber.on('message', async (channel, message) => {
            try {
              const payload = JSON.parse(message);
              const clientId = payload.clientId;
              const content = payload.content;
              const agent = await this.prisma.agent.findUnique({
                where: {id: payload.agentId}
              });
              const leadKeywords = agent.leadInfo.split(',');
              console.log(`Received message from ${channel}: ${message}`);
              const result = await this.findLead(content, leadKeywords);
              console.log(result)
              let jsonLead = undefined;
              if(result.content && result.content.includes('```json')) {
                jsonLead = this.extractJsonFromMarkdown(result.content);
              } else {
                jsonLead = JSON.parse(result.content);
              }
              const resContent = jsonLead ? jsonLead : { lead: false};
              let types = jsonLead.type.split(',')
              resContent.title = this.getFieldTitle(types[0])
              if(resContent.lead)
                this.redisPublisher.publish('leadfound', JSON.stringify({clientId: clientId, content: resContent}));
            } catch(error) {
              console.log(error)
            }
          });
    }

    getFieldTitle(field) {
      return field
        .split('_') // Split the string on underscores
        .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize the first letter of each word
        .join(' '); // Join the words with a space
    }

    async findLead(content: string, leadKeywords: string[]){
        let prompt = LEAD_OBSORVER_PROMPT_TEMPLATE;
        leadKeywords = leadKeywords.map(function(str) {
          return str.toLowerCase().trim().replace(/\s+/g, '_');
        });
        prompt = prompt.replaceAll('{{fields}}', leadKeywords.join(', '));
        prompt = prompt.replaceAll('{{exampleField1}}', leadKeywords[0]);
        if(leadKeywords.length > 1)
          prompt = prompt.replaceAll('{{exampleField2}}', leadKeywords[1]);
        else 
          prompt = prompt.replaceAll('{{exampleField2}}', leadKeywords[0])

        prompt = prompt.replaceAll('{{message}}', content);
        
        const promptMesssage = [
            {role: 'system', content: prompt},
        ];
        return await this.llmService.sendDirect(promptMesssage, LLMNames.COHERE, LLMModels.COHER_COMMAND_R_PLUS);
    }
}
