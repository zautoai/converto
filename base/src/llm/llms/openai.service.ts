import { Injectable } from '@nestjs/common';
import OpenAI from "openai";
import { ChatCompletionMessageParam } from 'openai/resources';
import { LLMServiceIntf } from '../llm.interface';
import * as fs from "fs";
import { AgentConfig, UserMessage, ZautoChatCompletionMessage } from './llm.models';
import { sleep } from 'openai/core';

@Injectable()
export class OpenAIService implements LLMServiceIntf {

    private openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
    });
    private llmModel = process.env.OPEN_AI_MODEL;

    constructor() {}
    

    async chat(chatHistory: ZautoChatCompletionMessage[], prompt?: string, ) {
        try {
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
            const chatCompletion = await this.openai.chat.completions.create({
                messages: messages,
                model: this.llmModel,
                temperature: 0.7,
                
            });
            const reply = chatCompletion.choices[0].message;
            const outputTokens = reply.content.length/4;
            console.log('Output Tokens: '+outputTokens)
            return reply;
        } catch(error) {
            console.log(error)
        }
    }

    async getLLMOutput(chatHistory: ZautoChatCompletionMessage[], model: string) {
        try {
            console.log("Preparing the Req: ", new Date())
            const totalRequest = chatHistory.map(item => item.content).join('');
            const inputTokens = totalRequest.length/4;
            console.log('Input Tokens: ' + inputTokens)
            const messages = [];
            if(prompt) {
                messages.push({ role: 'system', content: prompt })
            }
            messages.push(...chatHistory)
            console.log("Request is: ", messages)
            const chatCompletion = await this.openai.chat.completions.create({
                messages: messages,
                model: model,
                temperature: 0.7,
            });
            const reply = chatCompletion.choices[0].message;
            const outputTokens = reply.content.length/4;
            console.log('Output Tokens: '+outputTokens)
            return reply;
        } catch(error) {
            console.log(error)
        }
    }

    async uploadFile(filePath: string) {
        try {
            const file = await this.openai.files.create({
                file: fs.createReadStream(filePath),
                purpose: "assistants",
            });
            console.log(file);
            return {
                id: file.id,
                name: file.filename,
            };
        } catch(error) {
            console.log(error)
        }
        return null;
    }

    async getFile(id: string) {
        const file = await this.openai.files.retrieve(id);
        return file;
    }

    async deleteFile(fileId: string) {
        try {
            const file = await this.openai.files.del(fileId)
        return {
            id: file.id,
        };
        } catch (erro) {
            console.log(erro)
        }
        return null;
    }

    async createAgent(config: AgentConfig) {
        try {

            let tools = [];
            if(config.tools) {
                for(let tool of config.tools) {
                    tools.push({"type": "function", "function": tool});
                }
            }
            
            tools.push({"type": "retrieval"});

            const assistant = await this.openai.beta.assistants.create({
                name: config.name,
                instructions: config.instructions,
                tools: tools,
                model: config.model,
                file_ids: config.fileIds,
            });
            return assistant;
        } catch(error) {
            console.log(error)
        }
        
    }

    async updateAgent(config: AgentConfig) {
        try {
            const updatedAssistant = await this.openai.beta.assistants.update(
                config.id,
                {
                  instructions:config.instructions,
                  name: config.name,
                  tools: [{ type: "retrieval" }],
                  model: config.model,
                  file_ids: config.fileIds,
                });
            return updatedAssistant;
        } catch(error) {
            console.log(error)
        }
    }

    async deleteAgent(assistantId: string) {
        try {
            const updatedAssistant = await this.openai.beta.assistants.del(assistantId);
            return updatedAssistant;
        } catch(error) {
            console.log(error)
        }
    }

    async linkFileToAgent(config: AgentConfig) {
        try {
            const assistantFile = await this.openai.beta.assistants.files.create(
                config.id, 
                { 
                  file_id: config.fileId
                });
            return assistantFile;
        } catch(error) {
            console.log(error)
        }
        
    }

    async unlinkFileFromAgent(config: AgentConfig) {
        try {
            const deletedAssistantFile = await this.openai.beta.assistants.files.del(
                config.id,
                config.fileId
              );
            const deletedFile = await this.deleteFile(config.fileId);
            console.log(deletedAssistantFile);
            console.log(deletedFile);
            return deletedAssistantFile;
        } catch(error) {
            console.log(error)
        }
    }

    async getAgentFiles(id: string) {
        try {
            const assistantFiles = await this.openai.beta.assistants.files.list(id);
            return assistantFiles;
        } catch(error) {
            console.log(error)
        }
       
    }

    async getAgent(id: string) {
        try {
            const assistant = await this.openai.beta.assistants.retrieve(id);
            return assistant;
        } catch(error) {
            console.log(error)
        }
       
    }

    async getAllAgents(after: string = null) {
        try {
            const assistants = (await this.openai.beta.assistants.list({
                order: "desc",
                limit: 50,
                after: after,
              }));
            return assistants;
        } catch(error) {
            console.log(error)
        }
       
    }

    async getAgents(after: string = null) {
        return await this.getAllAgents(after);
    }

    async initiatChat() {
        try {
            const thread = await this.openai.beta.threads.create();
            return thread;
        } catch(error) {
            console.log(error)
        }
    }

    getFunctionOutput(toolCalls: any[], cbFunctions: any) {
        const outputs = [];
        for(let toolCall of toolCalls) {
            const cbFunction = cbFunctions[toolCall.function.name];
            if(cbFunction) {
                outputs.push({
                    tool_call_id: toolCall.id,
                    output: cbFunction(toolCall.function.arguments),
                });
            }
        }
        return outputs;
    }

    async sendMessageToAgent(threadId: string, userMessage: UserMessage): Promise<any> {
        try {
            const message = await this.openai.beta.threads.messages.create(
                threadId,
                {
                    role: "user",
                    content: userMessage.content,
                    file_ids: userMessage.fileIds,
                });
            let run = await this.openai.beta.threads.runs.create(
                threadId,{ 
                      assistant_id: userMessage.id,
                      instructions: userMessage.instruction,
                    });
            while(run.status === "in_progress" || run.status === "queued") {
                run = await this.openai.beta.threads.runs.retrieve(threadId,run.id);
                await sleep(1000);
            }
            if(run.status === 'requires_action') {
                console.log(run.required_action.submit_tool_outputs.tool_calls);
                
                const toolsOutput = this.getFunctionOutput(run.required_action.submit_tool_outputs.tool_calls,
                     userMessage.cbFunctions);
                run = await this.openai.beta.threads.runs.submitToolOutputs(threadId,run.id,{tool_outputs: toolsOutput});
                while(run.status === "in_progress" || run.status === "queued") {
                    run = await this.openai.beta.threads.runs.retrieve(threadId,run.id);
                    await sleep(1000);
                }
            }
            const messages = await this.openai.beta.threads.messages.list(threadId);
            return messages;
        } catch(error) {
            console.log(error)
        }
        
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
