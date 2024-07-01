import { Injectable } from "@nestjs/common";
import { LLMServiceIntf } from "../llm.interface";
import { ZautoChatCompletionMessage, AgentConfig, UserMessage } from "./llm.models";
import { LLMModels } from "../llm.contants";
import { BedrockService } from "./bedrock.service";

@Injectable()
export class AwsService implements LLMServiceIntf {


    constructor(
        private bedrockService:BedrockService
    ){

    }

    async chat(chatHistory: ZautoChatCompletionMessage[], prompt?: string) {
        if(prompt){
            chatHistory.push({
                role: "system",
                content: prompt
            });
        }
        const message = JSON.stringify(chatHistory)
        const response =  await this.bedrockService.invokeBedrockModel(message,LLMModels.AWS_CLAUDE_3_SONNET)
        return {content:response}
    }
    
    async getLLMOutput(chatHistory: ZautoChatCompletionMessage[], model: string) {
        console.log("Preparing the Req: ", new Date())
        const message = JSON.stringify(chatHistory)
        const response =  await this.bedrockService.invokeBedrockModel(message,LLMModels.AWS_CLAUDE_3_SONNET)
        return {content:response}
    }
    uploadFile(filePath: string) {
        throw new Error("Method not implemented.");
    }
    deleteFile(id: string) {
        throw new Error("Method not implemented.");
    }
    getFile(id: string) {
        throw new Error("Method not implemented.");
    }
    createAgent(config: any) {
        throw new Error("Method not implemented.");
    }
    updateAgent(config: AgentConfig) {
        throw new Error("Method not implemented.");
    }
    deleteAgent(assistantId: string) {
        throw new Error("Method not implemented.");
    }
    linkFileToAgent(config: AgentConfig) {
        throw new Error("Method not implemented.");
    }
    unlinkFileFromAgent(config: AgentConfig) {
        throw new Error("Method not implemented.");
    }
    getAgent(id: string) {
        throw new Error("Method not implemented.");
    }
    getAgents(after: string) {
        throw new Error("Method not implemented.");
    }
    initiatChat() {
        throw new Error("Method not implemented.");
    }
    sendMessageToAgent(thread: any, userMessage: UserMessage) {
        throw new Error("Method not implemented.");
    }
    isContentFlagged(content: string) {
        throw new Error("Method not implemented.");
    }
}