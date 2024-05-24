import { Injectable, OnModuleInit } from '@nestjs/common';
import { LlmService } from 'src/llm/llm.service';
import Redis, { Redis as RedisClient } from 'ioredis';
import { PrismaService } from 'src/prisma/prisma.service';
import { CTA_SELECTOR_PROMPT } from 'src/common/templates/cta-selector.template';
import { PAGE_SELECTOR_PROMPT } from 'src/common/templates/page-selector.template';
import { CTAType } from 'src/common/enums/enums';
import { STARTER_GENERATOR_PROMPT } from 'src/common/templates/starter-generator.template';
import { LLMModels, LLMNames } from 'src/llm/llm.contants';
import { BaseService } from 'src/common/services/base.service';
import { ServiceParams } from 'src/common/models/service-param.model';

@Injectable()
export class CTASelectorService extends BaseService implements OnModuleInit {

  private redisPublisher: RedisClient;
  private redisSubscriber: RedisClient;

  constructor(private readonly llmService: LlmService,
  ) {

    super();
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

  async handleMessage(channel: any, message: any) {
    try {
      const payload = JSON.parse(message);
      const orgId = payload.orgId
      if(!orgId)
      {
        throw new Error("OrgId is required"); 
      }
      const prisma = await this.getPrismaClient(orgId);
      console.log(`Received message from ${channel}: ${message}`);
      if (!payload.clientId) return; // No clientId to proceed with

      const agent = await prisma.agent.findUnique({ where: { id: payload.agentId } });
      if (!agent) return; // No agent found
      // Perform all relevant DB queries in parallel to improve performance
      const [content, ctaList, pageList] = await Promise.all([
        this.getContent({ orgId,  data:{payload}  }),
        this.getCtaList({ orgId, data: { types: [CTAType.CALENDAR, CTAType.CTA] } }),
        this.getCtaList({ orgId, data: { types: [CTAType.NAVIGATOR] } })
      ]);

      if (content.length >= 2) {
        this.generateStarters({ orgId, data: { clientId: payload.clientId, content, agent } });
      }

      const ctaIds = [...await this.processContentForCTAs({ orgId, data: { content, ctaList } }), ...await this.processContentForCTAs({ orgId, data: { content, ctaList: pageList }, isCTA: false })];

      if (ctaIds.length > 0) {

        const selectedCTAs = await prisma.callToAction.findMany({ where: { id: { in: ctaIds } } });
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

  async getContent(serviceParams: ServiceParams<{ payload }>) {
    const { orgId, data: { payload } } = serviceParams;
    const prisma = await this.getPrismaClient(orgId);
    return await prisma.zautoMessage.findMany({
      where: { convId: payload.convId, type: 'TEXT' },
      take: -2, // Take the last two records
      orderBy: {
        createdAt: 'asc'
      }
    });
  }

  async getCtaList(serviceParams: ServiceParams<{ types }>) {
    const { orgId, data: { types } } = serviceParams;
    const prisma = await this.getPrismaClient(orgId);
    return prisma.callToAction.findMany({
      where: { type: { in: types } },
    });
  }

  async processContentForCTAs(serviceParams: ServiceParams<{ content, ctaList }>) {
    const { orgId, data: { content, ctaList }, isCTA = true } = serviceParams;
    const result = isCTA ? await this.selectCTA( content, ctaList )
      : await this.selectPage({ orgId, data: { content, pageList: ctaList } });
    console.log("selected cta ", result);
    let selectedCTAs = [];
    if (result.content && result.content.includes('```json')) {
      selectedCTAs = this.extractJsonFromMarkdown(result.content);
    } else {
      selectedCTAs = JSON.parse(result.content);
    }
    return selectedCTAs.length > 0 ? selectedCTAs : [];
  }

  getFieldTitle(serviceParams: ServiceParams<{ field }>) {
    const { orgId, data: { field } } = serviceParams;
    return field
      .split('_') // Split the string on underscores
      .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize the first letter of each word
      .join(' '); // Join the words with a space
  }

  async selectCTA(content: any, ctaList: any ) {
    let prompt = CTA_SELECTOR_PROMPT;
    prompt = prompt.replaceAll('{{conversation}}', JSON.stringify(content));
    prompt = prompt.replaceAll('{{ctasList}}', JSON.stringify(ctaList));


    const promptMesssage = [
      { role: 'system', content: prompt },
    ];
    return await this.llmService.sendDirect(promptMesssage, LLMNames.COHERE, LLMModels.COHER_COMMAND_R_PLUS);
  }

  async selectPage(serviceParams: ServiceParams<{ content: any, pageList: any }>) {
    const { orgId, data: { content, pageList } } = serviceParams;
    let prompt = PAGE_SELECTOR_PROMPT;
    prompt = prompt.replaceAll('{{conversation}}', JSON.stringify(content));
    prompt = prompt.replaceAll('{{pageList}}', JSON.stringify(pageList));

    console.log(prompt);

    const promptMesssage = [
      { role: 'system', content: prompt },
    ];
    return await this.llmService.sendDirect(promptMesssage, LLMNames.COHERE, LLMModels.COHER_COMMAND_R_PLUS);
  }

  async generateStarters(serviceParams: ServiceParams<{ clientId: string, content: any, agent: any }>) {
    const { orgId, data: { clientId, content, agent } } = serviceParams;
    let prompt = STARTER_GENERATOR_PROMPT;
    let starts = agent.starters ? agent.starters.split(',') : "";
    let starterList = [];
    for (let starter of starts) {
      starterList.push({ content: starter, type: 'starters' });
    }
    prompt = prompt.replaceAll('{{companyName}}', agent.companyName);
    prompt = prompt.replaceAll('{{companyBusiness}}', agent.companyBusiness);
    prompt = prompt.replaceAll('{{companyValues}}', agent.companyValue);
    const _messages = content.map(message => {
      return {
        content: message.content,
        role: message.role
      }
    })
    prompt = prompt.replaceAll('{{conversation}}', JSON.stringify(_messages));
    //prompt = prompt.replaceAll('{{starters}}', JSON.stringify(starterList));
    const promptMesssage = [
      { role: 'system', content: prompt },
      // { role: 'user', content: JSON.stringify(content) }
    ];
    let result = await this.llmService.sendDirect(promptMesssage, LLMNames.COHERE, LLMModels.COHER_COMMAND_R);

    if (result.content && result.content.includes('```json')) {
      starterList = this.extractJsonFromMarkdown(result.content);
    } else {
      starterList = JSON.parse(result.content);
    }
    this.redisPublisher.publish('ctaselected', JSON.stringify({ clientId, content: { starters: starterList } }));
  }
}
