import { Injectable, OnModuleInit } from "@nestjs/common";
import { extractJsonFromMarkdown } from "src/common/helpers/extractJson.helper";
import { INTENT_SCORE_PROMPT } from "src/common/templates/intentscore.prompt";
import { LLMModels, LLMNames } from "src/llm/llm.contants";
import { LlmService } from "src/llm/llm.service";


@Injectable()
export class IntentScoreGeneratorService implements OnModuleInit{

    constructor(private readonly llmService: LlmService) {}

    onModuleInit() { 
    }

    async getIntentScore(rules: string,activities:string) {
        const result = await this.generateIntentScore(rules,activities);
        return this.processResultContent(result.content);
    }

    private processResultContent(content: string) {
        let jsonResponse;
        if (content && content.includes('```json')) {
          jsonResponse = extractJsonFromMarkdown(content);  
        } else {
          jsonResponse = JSON.parse(content);
        }
        return jsonResponse;
    }

    private async generateIntentScore(rules: string,activities:string) {
        const content = INTENT_SCORE_PROMPT.replaceAll("{{rules}}",rules).replaceAll("{{activities}}", activities);
        const promptMessage = [
            { role: 'system', content: content },
        ]; 
         
        return await this.llmService.sendDirect(promptMessage,LLMNames.OPENAI,LLMModels.GPT_3_5_TURBO);  
    }

}