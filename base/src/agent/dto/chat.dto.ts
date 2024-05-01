import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsObject } from "class-validator";
import { ZautoChatCompletionMessage } from "src/llm/llms/llm.models";


export class ChatMessage {
    
    @ApiProperty()
    @IsArray()
    @IsObject({ each: true })
    messages: ZautoChatCompletionMessage[]
}