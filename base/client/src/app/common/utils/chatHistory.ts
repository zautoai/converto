import { GLOBAL_IMAGES } from "src/app/config/image.config";
import { SentBy } from "src/app/widgets/chat-bot-widgets/message/message.component";


export class ChatMessage {
    constructor(
        public id: string,
        public orgId: string,
        public agentId: string,
        public convId: string,
        public role: string,
        public content: string,
        public type: string,
        public url: string,
        public vote: string,
        public feedback: string,
        public sentimental: string,
        public sentByHuman: boolean,
        public sentById: string,
        public createdAt: string,
        public modifiedAt: string
    ) { 
        if(role === SentBy.ASSISTANT)
        {
            this.url = GLOBAL_IMAGES.default_avatar_image;
        }
        else {
            this.url = GLOBAL_IMAGES.default_user;
        }
    }
}

export class ChatHistory {
    private chatHistory: ChatMessage[] = [];

    constructor() { }

    //   add single message
    addMessage(messageObject: any) {
        this.chatHistory.push(messageObject);
    }

    //   add multiple messages
    addMessages(messageObjects: ChatMessage[]) {
        this.chatHistory = this.chatHistory.concat(messageObjects);
    }

    //   Get all messages
    getMessages(){
        return this.chatHistory;
    }

    //   get single message by Id
    getMessageById(messageId: string): ChatMessage | null {
        return this.chatHistory.find((message) => message.id === messageId) || null;
    }

    // get single message by role
    deleteLeadFromChat(){
        const messageIndex = this.chatHistory.findIndex((message) => message.role === SentBy.LEAD);
        if (messageIndex !== -1) {
            this.chatHistory.splice(messageIndex, 1);
        }
    }

    //   get last message from history
    getLastMessage(): ChatMessage | null {
        if (this.chatHistory.length === 0) {
            return null;
        }
        return this.chatHistory[this.chatHistory.length - 1];
    }

    //   get firts message from history
    getFirstMessage(): ChatMessage | null {
        if (this.chatHistory.length === 0) {
            return null;
        }
        return this.chatHistory[0];
    }

    //   delete single message by Id
    deleteMessage(messageId: string) {
        const messageIndex = this.chatHistory.findIndex((message) => message.id === messageId);

        if (messageIndex !== -1) {
            this.chatHistory.splice(messageIndex, 1);
        }
    }

    //   clear chat histrory
    clearChatHistory() {
        this.chatHistory = [];
    }
}