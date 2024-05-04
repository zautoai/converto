import { Injectable } from "@nestjs/common";
import { LLMServiceIntf } from "../llm.interface";
import { catchError, firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { ZautoChatCompletionMessage, AgentConfig, UserMessage } from "./llm.models";
import { HttpService } from "@nestjs/axios";
import { CohereClient } from 'cohere-ai';


@Injectable()
export class CohereAIService implements LLMServiceIntf {
    
    private cohere_key = process.env.COHERE_API_KEY;
    private cohereClient = new CohereClient({
        token: this.cohere_key
    });

    constructor(private readonly httpService: HttpService) {}

    chat(chatHistory: ZautoChatCompletionMessage[], prompt?: string) {
        throw new Error("Method not implemented.");
    }
    async getLLMOutput(chatHistory: ZautoChatCompletionMessage[], model: string) {
        console.log("Preparing the Req: ", new Date())
        const messages = this.chatHistoryFormat(chatHistory.slice(0, -1));
        const message = chatHistory[chatHistory.length - 1].content;

        console.log("Request is: ", messages)

        const chatCompletion = await this.cohereClient.chat({
            message: message,
            model: model,
            chatHistory: messages,
            temperature:0.7,
            // maxTokens: 1000,
            // seed: 1337,
            promptTruncation: 'OFF'
        });
        const reply = {role:'assistant',content:chatCompletion.text};
        const outputTokens = reply.content.length/4;
        console.log('Output Tokens: '+outputTokens)
        return reply;
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

    chatHistoryFormat(chatHistory) {
        return chatHistory.map(item => {
            return {
                role: item.role === 'user' ? 'USER' : 'SYSTEM' ,
                message: item.content
            };
        });
    }

}