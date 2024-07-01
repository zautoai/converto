import { Injectable, OnModuleInit } from '@nestjs/common';
import { OpenAIService } from './llms/openai.service';
import { LLMServiceIntf } from './llm.interface';
import { LLMNames } from './llm.contants';
import { CohereAIService } from './llms/cohereai.service';
import { ClaudeAIService } from './llms/claudeai.service';
import { MistralAIService } from './llms/mistralai.service';
import { AwsService } from './llms/aws.service';


@Injectable()
export class LlmProvider implements OnModuleInit{

    llmServices = {};

    constructor(
        private openaiService: OpenAIService, 
        private mistralService: MistralAIService,
        private cohereService: CohereAIService,
        private claudeAIService: ClaudeAIService,
        private awsSerice: AwsService
    ) {}

    onModuleInit() {
        this.llmServices[LLMNames.OPENAI] = this.openaiService;
        this.llmServices[LLMNames.MISTRAL] = this.mistralService;
        this.llmServices[LLMNames.COHERE] = this.cohereService;
        this.llmServices[LLMNames.CLAUDE] = this.claudeAIService;
        this.llmServices[LLMNames.AWS] = this.awsSerice;
    }

    getLLM(name: string): LLMServiceIntf {
        return this.llmServices[name];
    }
    
}
