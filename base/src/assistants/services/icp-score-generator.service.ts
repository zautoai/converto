import { Injectable, OnModuleInit } from "@nestjs/common";
import { extractJsonFromMarkdown } from "src/common/helpers/extractJson.helper";
import { ICP_SCORE_PROMPT } from "src/common/templates/icpscore.prompt";
import { LLMModels, LLMNames } from "src/llm/llm.contants";
import { LlmService } from "src/llm/llm.service";
import { ContactService } from "src/microservices/crm_service/contact.service";
import { IcpMicroService } from "src/microservices/crm_service/icp.service";

@Injectable()
export class IcpScoreGenerator implements OnModuleInit {

    constructor(private readonly llmService: LlmService,
        private readonly contactService: ContactService,
        private readonly icpService: IcpMicroService
    ) { }

    async onModuleInit() {
        // const icpList = (await this.icpService.getIcps("50bd4a29-fbfe-498b-ab4b-ae3910f1dc24")).data;
        // const formattedIcpList = JSON.stringify(this.transformData(icpList));
        // const contact = (await this.contactService.getContact("50bd4a29-fbfe-498b-ab4b-ae3910f1dc24", "273ce4fb-abe6-48f5-a941-f9dba30cb347")).data;
        // console.log("IcP called");

        // this.getIcpScore(JSON.stringify(contact), formattedIcpList);
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

    transformData(inputData: any) {
        return inputData.map(company => {
            const { id, name, description, score, segment } = company;
            const transformedSegment = segment.map(seg => {
                const { name, description, segmentCategory } = seg;
                const { name: categoryName, description: categoryDescription } = segmentCategory;
                return {
                    name,
                    description,
                    segmentCategory: {
                        name: categoryName,
                        description: categoryDescription
                    }
                };
            });
            return {
                id,
                name,
                description,
                score,
                segment: transformedSegment
            };
        });
    }

}
