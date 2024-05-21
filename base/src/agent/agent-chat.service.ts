import { Injectable, ServiceUnavailableException } from "@nestjs/common";
import { AgentPromptService } from "src/agent-prompt/agent-prompt.service";
import { ZautoChatCompletionMessage } from "src/llm/llms/llm.models";
import { AgentService } from "./agent.service";
import { LlmService } from "src/llm/llm.service";
import { ChromaDBService } from "src/chroma/chroma-dbservice/chroma-db.service";
import { Agent } from "./entities/agent.entity";
import { ServiceParams } from "src/common/models/service-param.model";

@Injectable()
export class ChatService{

    constructor(
        private readonly promptService: AgentPromptService,
        private readonly agentService: AgentService,
        private readonly llmService: LlmService,
        private readonly chromaService: ChromaDBService){
        }

    async chatById(serviceParams: ServiceParams<{agetId:string ,messages: ZautoChatCompletionMessage[]}>) {
        const {orgId, data} = serviceParams;
        const {agetId, messages} = data;
        const prompt = await this.promptService.findByAgent(orgId,agetId);
        const agent = await this.agentService.findOne(orgId,agetId)
        const context = await this.chromaService.queryDocs(agent.name, messages.pop().content);
        const systemPrompt = prompt.text.replace('{{context}}', context.documents.join('\n'));
        const _messages = [{role: 'system', content: systemPrompt}, ...messages]
        const completion = await this.llmService.chat(_messages);
        // const completion = await this.llmService.sendDirect(_messages,LLMNames.COHERE,LLMModels.COHER_COMMAND_R);
        return completion;
    }

    async chat(serviceParams: ServiceParams<{agent:Agent ,messages: ZautoChatCompletionMessage[]}>) {
        try {
            const {orgId, data} = serviceParams;
            const {agent, messages} = data;
            console.log("Starting the chat: ", new Date())
            const prompt = await this.promptService.findByAgent(orgId,agent.id);
            console.log("Got the prompt: ", new Date())
            const context = await this.chromaService.queryDocs(agent.name, messages[messages.length - 1].content);
            
            console.log("Got the Context: ", new Date())
            const systemPrompt = prompt.text.replace('{{context}}', context.documents.join('\n'));
            console.log(systemPrompt)
            console.log("Replaced the Context: ", new Date())
            const _messages = [{role: 'system', content: systemPrompt}, ...messages]
            // const completion = await this.llmService.sendDirect(_messages,LLMNames.COHERE,LLMModels.COHER_COMMAND_R_PLUS);
            const completion = await this.llmService.chat(_messages); 
            console.log("Got the Response: ", new Date())
            return {
                message: completion,
                history: _messages
            }
        } catch(error) {
            console.error(error);
            throw new ServiceUnavailableException('The agent is not ready or not trianed properly.')
        }
    }

    async initChat() {
        return await this.llmService.initiatChat();
    }

    async chatWithAssistant(thread: any, assistantId: string, message: ZautoChatCompletionMessage) {
        return await this.llmService.sendMessageToAgent(thread, {id: assistantId, content: message.content});
    }
}