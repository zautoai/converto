import { Injectable, OnModuleInit } from "@nestjs/common";
import { extractJsonFromMarkdown } from "src/common/helpers/extractJson.helper";
import { INTENT_SCORE_PROMPT } from "src/common/templates/intentscore.prompt";
import { LlmService } from "src/llm/llm.service";


@Injectable()
export class IntentScoreGeneratorService implements OnModuleInit{

    constructor(private readonly llmService: LlmService) {}

    onModuleInit() {
    }

    async getIntentScore(rules: string,activities:string) {
        const result = await this.generateIntentScore(rules,activities);
        return this.processResultContent(result);
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
        const content = INTENT_SCORE_PROMPT.replaceAll("{{rules}}",rules)
        const promptMessage = [
            { role: 'system', content: content },
            { role: 'user', content: activities }
        ];
         
        return await this.llmService.chat(promptMessage);
    }

}