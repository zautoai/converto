
import { AgentConfig, UserMessage, ZautoChatCompletionMessage } from "./llms/llm.models";



export interface LLMServiceIntf {
    chat(chatHistory: ZautoChatCompletionMessage[], prompt?: string): any;

    getLLMOutput(chatHistory: ZautoChatCompletionMessage[], model: string): any;

    uploadFile(filePath: string): any;

    deleteFile(id: string): any;

    getFile(id: string): any;

    createAgent(config: any): any;

    updateAgent(config: AgentConfig): any;

    deleteAgent(assistantId: string): any;

    linkFileToAgent(config: AgentConfig): any;

    unlinkFileFromAgent(config: AgentConfig): any;

    getAgent(id: string) : any;

    getAgents(after: string): any;

    initiatChat() : any;

    sendMessageToAgent(thread: any, userMessage: UserMessage): any;

    isContentFlagged(content: string): any;
}