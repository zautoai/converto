import { Injectable,OnModuleInit } from '@nestjs/common';
import { extractJsonFromMarkdown } from 'src/common/helpers/extractJson.helper';
import { MAPPER_TEMPLATE } from 'src/common/templates/claude/mapper-prompt.template';
import { LLMModels, LLMNames } from 'src/llm/llm.contants';
import { LlmService } from 'src/llm/llm.service';

@Injectable()
export class MapperService implements OnModuleInit {

    constructor(
        private readonly llmService: LlmService
    ){}

    async onModuleInit() {
        
    }

    async handleMap(defaultFields:string[],externalFields:any) {
        let prompt = MAPPER_TEMPLATE;
        prompt = prompt.replaceAll('{{defaultFields}}', defaultFields.toString());
        prompt = prompt.replaceAll('{{externalFields}}', JSON.stringify(externalFields));
        const promptMesssage = [
        { role: 'system', content: prompt },
        ];
        const result = await this.llmService.sendDirect(promptMesssage, LLMNames.COHERE, LLMModels.COHER_COMMAND_R_PLUS);
        return await extractJsonFromMarkdown(result.content);
        
    }

}
 