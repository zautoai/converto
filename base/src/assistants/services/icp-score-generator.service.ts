import { Injectable, OnModuleInit } from "@nestjs/common";
import { extractJsonFromMarkdown } from "src/common/helpers/extractJson.helper";
import { ICP_SCORE_PROMPT } from "src/common/templates/icpscore.prompt";
import { LLMModels, LLMNames } from "src/llm/llm.contants";
import { LlmService } from "src/llm/llm.service";

@Injectable()
export class IcpScoreGenerator implements OnModuleInit {

    constructor(
        private readonly llmService: LlmService,
    ) { }

    async onModuleInit() {
    }

    async getIcpScore(contact: string, icpList: string) {
        const result = await this.generateIcpScore(contact, icpList);
        console.log(result);
        return this.processResultContent(result.content);
    }

    private processResultContent(content: string) {
        let jsonResponse;
        if (content && content.includes('```json')) {
            jsonResponse = extractJsonFromMarkdown(content);
        } else {
            jsonResponse = JSON.parse(content);
        }
        console.log(jsonResponse);

        return jsonResponse;
    }

    private async generateIcpScore(contact: string, icpList: string) {
        const content = ICP_SCORE_PROMPT.replaceAll("{{icpList}}", icpList)
        const promptMessage = [
            { role: 'system', content: content },
            { role: 'user', content: contact }
        ];

        return await this.llmService.sendDirect(promptMessage, LLMNames.OPENAI, LLMModels.GPT_3_5_TURBO)
    }

}
