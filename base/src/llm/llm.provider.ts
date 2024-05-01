import { Injectable, OnModuleInit } from '@nestjs/common';
import { OpenAIService } from './llms/openai.service';
import { LLMServiceIntf } from './llm.interface';
import { LLMNames } from './llm.contants';
import { MistralAIService } from './llms/mistralai.servic';
import { CohereAIService } from './llms/cohereai.service';
import { ClaudeAIService } from './llms/claudeai.service';


@Injectable()
export class LlmProvider implements OnModuleInit{

    llmServices = {};

    constructor(
        private openaiService: OpenAIService, 
        private mistralService: MistralAIService,
        private cohereService: CohereAIService,
        private claudeAIService: ClaudeAIService,
    ) {}

    onModuleInit() {
        this.llmServices[LLMNames.OPENAI] = this.openaiService;
        this.llmServices[LLMNames.MISTRAL] = this.mistralService;
        this.llmServices[LLMNames.COHERE] = this.cohereService;
        this.llmServices[LLMNames.CLAUDE] = this.claudeAIService;
    }

    getLLM(name: string): LLMServiceIntf {
        return this.llmServices[name];
    }
    
}
