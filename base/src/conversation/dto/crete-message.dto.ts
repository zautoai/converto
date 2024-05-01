import { MessageMediaType } from "../entities/conversation.enums";


export class CreateMessageDto {

    orgId: string;
    
    agentId: string;

    convId: string;

    role: string;

    content: string;

    sentByHuman?: boolean = false;

    type?: MessageMediaType = MessageMediaType.TEXT;

    sentById?: string;

}