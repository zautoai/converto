import { MessageMediaType } from "../entities/conversation.enums";


export class CreateMessageDto {
    convId: string;

    role: string;

    content: string;

    sentByHuman?: boolean = false;

    type?: MessageMediaType = MessageMediaType.TEXT;

    sentById?: string;

}