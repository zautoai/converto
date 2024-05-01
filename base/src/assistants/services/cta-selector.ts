import { Injectable, OnModuleInit } from '@nestjs/common';
import { LlmService } from 'src/llm/llm.service';
import Redis, { Redis as RedisClient } from 'ioredis';
import { PrismaService } from 'src/prisma/prisma.service';
import { CTA_SELECTOR_PROMPT } from 'src/common/templates/cta-selector.template';
import { PAGE_SELECTOR_PROMPT } from 'src/common/templates/page-selector.template';
import { CTAType } from 'src/common/enums/enums';
import { STARTER_GENERATOR_PROMPT } from 'src/common/templates/starter-generator.template';
import { LLMModels, LLMNames } from 'src/llm/llm.contants';

@Injectable()
export class CTASelectorService implements OnModuleInit {

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

  async onModuleInit() {
    try {
      const count = await this.redisSubscriber.subscribe('selectcta');
      console.log(`Subscribed successfully! This client is currently subscribed to ${count} channels.`);
    } catch (err) {
      console.error('Failed to subscribe: %s', err.message);
      return; // Stop execution if subscription fails
    }
  
    this.redisSubscriber.on('message', this.handleMessage.bind(this));
  }
  
  async handleMessage(channel, message) {
    try {
      console.log(`Received message from ${channel}: ${message}`);
      const payload = JSON.parse(message);
      if (!payload.clientId) return; // No clientId to proceed with
  
      const agent = await this.prisma.agent.findUnique({ where: { id: payload.agentId } });
      if (!agent) return; // No agent found
      // Perform all relevant DB queries in parallel to improve performance
      const [content, ctaList, pageList] = await Promise.all([
        this.getContent(payload),  
        this.getCtaList(agent.orgId, [CTAType.CALENDAR, CTAType.CTA]),
        this.getCtaList(agent.orgId, [CTAType.NAVIGATOR])
      ]);

      if(content.length >= 2) {
        this.generateStarters(payload.clientId, content, agent);
      }
  
      const ctaIds = [...await this.processContentForCTAs(content, ctaList), ...await this.processContentForCTAs(content, pageList, false)];
  
      if (ctaIds.length > 0) {
        const selectedCTAs = await this.prisma.callToAction.findMany({ where: { id: { in: ctaIds } }});
        const ctaObjects = {
          ctas: selectedCTAs.filter(cta => (cta.type === CTAType.CTA || cta.type === CTAType.CALENDAR)),
          pageNavigators: selectedCTAs.filter(cta => cta.type === CTAType.NAVIGATOR)
        }
        this.redisPublisher.publish('ctaselected', JSON.stringify({ clientId: payload.clientId, content: ctaObjects }));
        
      }
    } catch (error) {
      console.error(error);
    }
  }
  
  async getContent(payload) {
    return await this.prisma.zautoMessage.findMany({
      where: {convId: payload.convId, type: 'TEXT'},
      take: -2, // Take the last two records
      orderBy: {
          createdAt: 'asc' 
      }
    }); 
  }
  
  async getCtaList(orgId, types) {
    return this.prisma.callToAction.findMany({
      where: { orgId, type: { in: types } },
    });
  }
  
  async processContentForCTAs(content, ctaList, isCTA = true) {
    const result = isCTA ? await this.selectCTA(content, ctaList)
    : await this.selectPage(content, ctaList);
    console.log("selected cta ", result);
    let selectedCTAs = [];
    if (result.content && result.content.includes('```json')) {
      selectedCTAs = this.extractJsonFromMarkdown(result.content);
    } else {
      selectedCTAs = JSON.parse(result.content);
    }
    return selectedCTAs.length > 0 ? selectedCTAs : [];
  }

  getFieldTitle(field) {
    return field
      .split('_') // Split the string on underscores
      .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize the first letter of each word
      .join(' '); // Join the words with a space
  }

  async selectCTA(content: any, ctaList: any) {
    let prompt = CTA_SELECTOR_PROMPT;
    prompt = prompt.replaceAll('{{conversation}}', JSON.stringify(content));
    prompt = prompt.replaceAll('{{ctasList}}', JSON.stringify(ctaList));

    const _content = prompt.replaceAll('<END_OF_TURN>', '');
    console.log(prompt);

    const promptMesssage = [
      { role: 'system', content: prompt },
      { role: 'user', content: _content }
    ];
    return await this.llmService.sendDirect(promptMesssage, LLMNames.COHERE, LLMModels.COHER_COMMAND_R_PLUS);
  }

  async selectPage(content: any, pageList: any) {
    let prompt = PAGE_SELECTOR_PROMPT;
    prompt = prompt.replaceAll('{{conversation}}', JSON.stringify(content));
    prompt = prompt.replaceAll('{{pageList}}', JSON.stringify(pageList));

    console.log(prompt);

    const promptMesssage = [
      { role: 'system', content: prompt },
    ];
    return await this.llmService.sendDirect(promptMesssage, LLMNames.COHERE, LLMModels.COHER_COMMAND_R_PLUS);
  }

  async generateStarters(clientId: string, content: any, agent: any) {
    let prompt = STARTER_GENERATOR_PROMPT;
    let starts = agent.starters ? agent.starters.split(',') : "";
    let starterList = [];
    for(let starter of starts) {
      starterList.push({content:starter,type:'starters'});
    }
    prompt = prompt.replaceAll('{{companyName}}', agent.companyName);
    prompt = prompt.replaceAll('{{companyBusiness}}', agent.companyBusiness);
    prompt = prompt.replaceAll('{{companyValues}}', agent.companyValue);
    const _messages = content.map(message => {
      return {
        content:message.content,
        role:message.role
      }
    })
    prompt = prompt.replaceAll('{{conversation}}', JSON.stringify(_messages));
    //prompt = prompt.replaceAll('{{starters}}', JSON.stringify(starterList));
    const promptMesssage = [
      { role: 'system', content: prompt },
      // { role: 'user', content: JSON.stringify(content) }
    ];
    let result =  await this.llmService.sendDirect(promptMesssage,LLMNames.COHERE,LLMModels.COHER_COMMAND_R);

    if (result.content && result.content.includes('```json')) { 
      starterList = this.extractJsonFromMarkdown(result.content);
    } else {
      starterList = JSON.parse(result.content);
    }
    this.redisPublisher.publish('ctaselected', JSON.stringify({ clientId, content: {starters: starterList} }));
  }
}
