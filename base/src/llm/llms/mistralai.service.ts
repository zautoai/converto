import { Injectable } from '@nestjs/common';
import { LLMServiceIntf } from '../llm.interface';
import { AgentConfig, UserMessage, ZautoChatCompletionMessage } from './llm.models';
import { HttpService } from '@nestjs/axios';
import { AxiosError } from 'axios';
import { catchError, firstValueFrom } from 'rxjs';
import OpenAI from 'openai';

@Injectable()
export class MistralAIService implements LLMServiceIntf {

    private mistralkey = process.env.MISTRAL_API_KEY;
    private llmModel = process.env.MISTRAL_AI_MODEL;

    private openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
    });

    constructor(private readonly httpService: HttpService) {}
    
    async chat(chatHistory: ZautoChatCompletionMessage[], prompt?: string, ) {
        console.log("Preparing the Req: ", new Date())
        let totalRequest = prompt + chatHistory.join()
        const inputTokens = totalRequest.length/4;
        console.log('Input Tokens: ' + inputTokens)
        const messages = [];
        if(prompt) {
            messages.push({ role: 'system', content: prompt })
        }
        messages.push(...chatHistory)

        console.log("Request is: ", messages)

        const { data } = await firstValueFrom(this.httpService.post("https://api.mistral.ai/v1/chat/completions", {
            model: this.llmModel,
            messages: messages,
            "temperature": 0.7,
            "top_p": 1,
            "max_tokens": 1000,
            "stream": false,
            "safe_prompt": false,
            "random_seed": 1337
        }, {
            headers: {
                'Authorization': `Bearer ${this.mistralkey}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        }).pipe(catchError((error: AxiosError) => {
                console.error(error);
                throw 'An error happened!';
              })))

        const reply = data.choices[0].message;
        const outputTokens = reply.content.length/4;
        console.log('Output Tokens: '+outputTokens)
        return reply;
    }

    async getLLMOutput(chatHistory: ZautoChatCompletionMessage[], model: string) {
        console.log("Preparing the Req: ", new Date())
        let totalRequest = prompt + chatHistory.join()
        const inputTokens = totalRequest.length/4;
        console.log('Input Tokens: ' + inputTokens)
        const messages = [];
        if(prompt) {
            messages.push({ role: 'system', content: prompt })
        }
        messages.push(...chatHistory)

        console.log("Request is: ", messages)

        const { data } = await firstValueFrom(this.httpService.post("https://api.mistral.ai/v1/chat/completions", {
            model: model,
            messages: messages,
            "temperature": 0.7,
            "top_p": 1,
            "max_tokens": 1000,
            "stream": false,
            "safe_prompt": false,
            "random_seed": 1337
        }, {
            headers: {
                'Authorization': `Bearer ${this.mistralkey}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        }).pipe(catchError((error: AxiosError) => {
                console.error(error);
                throw 'An error happened!';
        })))

        const reply = data.choices[0].message;
        const outputTokens = reply.content.length/4;
        console.log('Output Tokens: '+outputTokens)
        return reply;
    }

    async uploadFile(filePath: string) {
        throw new Error('Method not implemented.');
    }

    async deleteFile(id: string) {
        throw new Error('Method not implemented.');
    }
    
    async getFile(id: string) {
        throw new Error('Method not implemented.');
    }

    async createAgent(config: any) {
        throw new Error('Method not implemented.');
    }

    async updateAgent(config: AgentConfig) {
        throw new Error('Method not implemented.');
    }

    async deleteAgent(id: string) {
        throw new Error('Method not implemented.');
    }

    async linkFileToAgent(config: AgentConfig) {
        throw new Error('Method not implemented.');
    }

    async unlinkFileFromAgent(config: AgentConfig) {
        throw new Error('Method not implemented.');
    }
    
    async getAgent(id: string) {
        throw new Error('Method not implemented.');
    }

    async getAgents() {
        throw new Error('Method not implemented.');
    }
    
    async initiatChat() {
        throw new Error('Method not implemented.');
    }

    
    sendMessageToAgent(thread: any, userMessage: UserMessage) {
        throw new Error('Method not implemented.');
    }
    
    async isContentFlagged(content: string) {
        try {
            const result = await this.openai.moderations.create({
                input: content,
             });
             if(result.results[0].flagged) {
                return true;
             }
             else false;
        } catch(error) {
            console.log(error)
        }
    }
    
}
