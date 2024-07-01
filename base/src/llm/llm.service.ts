import { Injectable } from '@nestjs/common';
import { AgentConfig, AgentFile, LLM_PROVIDERS, UserMessage, ZautoChatCompletionMessage } from './llms/llm.models';
import { LlmProvider } from './llm.provider';
import { LLMServiceIntf } from './llm.interface';
import { throwError } from 'rxjs';
import { LLMModels, LLMNames } from './llm.contants';

@Injectable()
export class LlmService implements LLMServiceIntf{

    constructor(private llmProvider: LlmProvider) {}

    async chat(chatHistory: ZautoChatCompletionMessage[], options?: any) {
        const llmService = this.llmProvider.getLLM(LLM_PROVIDERS.COHERE);
        if(options && options.prompt) {
            return await llmService.chat(chatHistory, options.prompt);
        } else {
            return await llmService.chat(chatHistory);
        }
    }

    async sendDirect(message: ZautoChatCompletionMessage[], llmProvider: string, model: string) {
        const llmService = this.llmProvider.getLLM(LLMNames.AWS);
        return await llmService.getLLMOutput(message, LLMModels.AWS_CLAUDE_3_SONNET);
    }

    async getLLMOutput(message: ZautoChatCompletionMessage[], model: string) {
        throw new Error('Method not implemented.');
    }

    async uploadFile(filePath: string) : Promise<AgentFile> {
        const llmService = this.llmProvider.getLLM(LLM_PROVIDERS.COHERE);
        return await llmService.uploadFile(filePath);
    }

    async deleteFile(id: string) {
        const llmService = this.llmProvider.getLLM(LLM_PROVIDERS.COHERE);
        return await llmService.uploadFile(id);
    }

    async getFile(id: string) {
        const llmService = this.llmProvider.getLLM(LLM_PROVIDERS.COHERE);
        return await llmService.getFile(id);
    }

    async createAgent(config: AgentConfig) {
        const llmService = this.llmProvider.getLLM(LLM_PROVIDERS.COHERE);
        return await llmService.createAgent(config)
    }

    async updateAgent(config: AgentConfig) {
        const llmService = this.llmProvider.getLLM(LLM_PROVIDERS.COHERE);
        return await llmService.updateAgent(config);
    }

    async deleteAgent(id: string) {
        const llmService = this.llmProvider.getLLM(LLM_PROVIDERS.COHERE);
        return await llmService.deleteAgent(id);
    }


    async linkFileToAgent(config: AgentConfig) {
        const llmService = this.llmProvider.getLLM(LLM_PROVIDERS.COHERE);
        return llmService.linkFileToAgent(config);
    }

    async unlinkFileFromAgent(config: AgentConfig) {
        const llmService = this.llmProvider.getLLM(LLM_PROVIDERS.COHERE);
        return llmService.unlinkFileFromAgent(config);
    }

    async getAgent(id: string) {
        const llmService = this.llmProvider.getLLM(LLM_PROVIDERS.COHERE);
        return llmService.getAgent(id);
    }

    getAgents(after: string = null) {
        const llmService = this.llmProvider.getLLM(LLM_PROVIDERS.COHERE);
        return llmService.getAgents(after);
    }


    async initiatChat() {
        const llmService = this.llmProvider.getLLM(LLM_PROVIDERS.COHERE);
        return llmService.initiatChat();
    }

    async sendMessageToAgent(thread: any, userMessage: UserMessage) {
        const llmService = this.llmProvider.getLLM(LLM_PROVIDERS.COHERE);
        return llmService.sendMessageToAgent(thread, userMessage);
    }

    async isContentFlagged(content: string) {
        const llmService = this.llmProvider.getLLM(LLM_PROVIDERS.COHERE);
        return llmService.isContentFlagged(content);
    }
    
}
