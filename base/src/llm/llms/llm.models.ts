import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";
import { LLMNames } from "../llm.contants";


export class ZautoChatCompletionMessage {
    @ApiProperty()
    @IsString()
    role: string;

    @ApiProperty()
    @IsString()
    content: string;
}

export const LLM_PROVIDERS = {
    OPENAI: LLMNames.OPENAI,
    MISTRAL: LLMNames.MISTRAL,
    COHERE: LLMNames.COHERE
}

export class AgentFile {
    id: string;
    fileName: string;
}

export enum ToolType {
    FUNCTION='function',
    CODE_INTERPRETER= 'code_interpreter',
    RETRAIEVAL='retrieval'
}

export class ObjectProperty {
    type: string = 'string';
    description: string;
}

export class ObjectParameter {
    type: string = 'object';
    propperties: Object = {};

    addProperty(name: string, config: string) {
        if(!this.propperties) {
            this.propperties = {};
        }
        this.propperties[name] = config;
    }
}



export class AgentConfig {
    id?: string;
    name?: string;
    instructions?: string;
    fileIds?: string[];
    fileId?: string;
    model?: string;
    description?: string;
    tools?: any[]; 
}

export class LLMessage {
    role: string;
    content: string;
}

export class UserMessage {
    id: string;
    content: string;
    fileIds?: string[];
    instruction?: string = '';
    cbFunctions?: any = {};
}