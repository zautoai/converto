import { Injectable } from "@nestjs/common";
import { LLMServiceIntf } from "../llm.interface";
import { catchError, firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { ZautoChatCompletionMessage, AgentConfig, UserMessage } from "./llm.models";
import { HttpService } from "@nestjs/axios";


@Injectable()
export class ClaudeAIService implements LLMServiceIntf {

    private claude_key = process.env.CLAUDE_API_KEY;

    constructor(private readonly httpService: HttpService) {}

    chat(chatHistory: ZautoChatCompletionMessage[], prompt?: string) {
        throw new Error("Method not implemented.");
    }
    async getLLMOutput(chatHistory: ZautoChatCompletionMessage[], model: string) {
        console.log("Preparing the Req: ", new Date())
        let totalRequest =  chatHistory.join()
        const inputTokens = totalRequest.length/4;
        console.log('Input Tokens: ' + inputTokens)
        const message = chatHistory[0].content;

        console.log("Request is: ", message)

        const { data } = await firstValueFrom(this.httpService.post("https://api.anthropic.com/v1/messages", {
            model: model,
            messages: message,
            "temperature": 0.7,
            "top_p": 1,
            "max_tokens_to_sample": 1000,
            "stream": false,
            "safe_prompt": false,
        }, {
            headers: {
                'Authorization': `Bearer ${this.claude_key}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        }).pipe(catchError((error: AxiosError) => {
                console.error(error);
                throw 'An error happened!';
        })))

        const reply = {role:'assistant',content:data.completion};
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
    
}