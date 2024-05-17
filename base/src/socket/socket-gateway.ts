import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AgentService } from '../agent/agent.service';
import { ConversationService } from 'src/conversation/conversation.service';
import { ChatService } from '../agent/agent-chat.service';
import { ConversationType } from 'src/common/enums/enums';
import { ZautoChatCompletionMessage } from 'src/llm/llms/llm.models';
import { LlmService } from 'src/llm/llm.service';
import { VisitorService } from 'src/visitor/visitor.service';
import { ConversationStatus } from 'src/conversation/entities/conversation.entity';
import { LeadService } from 'src/lead/lead.service';
import Redis, { Redis as RedisClient } from 'ioredis';
import { JwtService } from '@nestjs/jwt';
import { ActiveClientService } from 'src/active-client/active-client.service';
import { MessageMediaType } from 'src/conversation/entities/conversation.enums';
import { UsageService } from 'src/account/usage.service';
import { SiteService } from 'src/site/site.service';



@Injectable()
@WebSocketGateway({
  cors: {
    origin: true, // specify allowed origin(s)
    methods: ['GET', 'POST'],    // specify allowed methods
    credentials: true            // if credentials are allowed
  }
})
export class SocketGateway implements OnModuleInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private redisPublisher: RedisClient;
  private redisSubscriber: RedisClient;

  constructor(private agentsService: AgentService, 
    private conversationService: ConversationService, 
    private chatService: ChatService,
    private llmService: LlmService,
    private visitorService: VisitorService,
    private leadService: LeadService,
    private jwtService: JwtService,
    private activeClientService: ActiveClientService,
    private siteService: SiteService,
    private readonly usageService: UsageService,
) {

      this.redisPublisher = new Redis({
        host: process.env.REDIS_IP,
        port: parseInt(process.env.REDIS_PORT, 10) || 6379,
        password: process.env.REDIS_PASSWORD
    });
      this.redisSubscriber = new Redis({
        host: process.env.REDIS_IP,
        port: parseInt(process.env.REDIS_PORT, 10) || 6379,
        password: process.env.REDIS_PASSWORD
    });
  }
  

  onModuleInit() {
    this.server.on('connection', (socket) => {
      console.log(socket.id)
      console.log('Connected')
    })

    this.server.on('disconnect', (socket) => {
      console.log(socket.id, 'Disconnected.')
    })

    this.redisSubscriber.subscribe('leadfound', (err, count) => {
      if (err) {
        console.error('Failed to subscribe: %s', err.message);
      } else {
        console.log(`Subscribed successfully! This client is currently subscribed to ${count} channels.`);
      }
    });

    this.redisSubscriber.subscribe('scheduleFound', (err, count) => {
      if (err) {
        console.error('Failed to subscribe: %s', err.message);
      } else {
        console.log(`Subscribed successfully! This client is currently subscribed to ${count} channels.`);
      }
    });
    this.redisSubscriber.subscribe('starterGenerated', (err, count) => {
      if (err) {
        console.error('Failed to subscribe: %s', err.message);
      } else {
        console.log(`Subscribed successfully! This client is currently subscribed to ${count} channels.`);
      }
    });

    this.redisSubscriber.subscribe('ctaselected', (err, count) => {
      if (err) {
        console.error('Failed to subscribe: %s', err.message);
      } else {
        console.log(`Subscribed successfully! This client is currently subscribed to ${count} channels.`);
      }
    });
    

    this.redisSubscriber.subscribe('avatarStatusUpdate', (err, count) => {
      if (err) {
        console.error('Failed to subscribe: %s', err.message);
      } else {
        console.log(`Subscribed successfully! This client is currently subscribed to ${count} channels.`);
      }
    });

    // Handle incoming messages
    this.redisSubscriber.on('message', (channel, message) => {
      console.log(`Received message from ${channel}: ${message}`);
      // Handle the message
      if(channel === 'leadfound') { 
        const lead = JSON.parse(message);
        if(lead.clientId) {
          this.server.to(lead.clientId).emit('leadfound', lead);
        }
      } 
      else if(channel === 'scheduleFound') { 
        const schedule = JSON.parse(message);
        if(schedule.clientId) {
          this.server.to(schedule.clientId).emit('scheduleFound', schedule);
        }
      } 
      else if(channel == 'ctaselected')
      {
        const cta = JSON.parse(message);
        console.log(cta)
        if(cta.clientId) {
          this.server.to(cta.clientId).emit('ctaselected', cta);
        }
      }
      else if(channel === 'avatarStatusUpdate') {
        const avatarStatus = JSON.parse(message);
        if(avatarStatus.avatarId) {
          const eventName = `${avatarStatus.avatarId}_avatarStatusUpdate`;
          this.server.emit(eventName, avatarStatus);
        }
      }
    });
  }

  async findReplayRequiredAndSend(converation: any, client: string) {
    const messages = await this.conversationService.getMessages(converation.id);
    const lastMessage = messages[0];
    if(lastMessage && lastMessage.role == 'user') {
      const replay = await this.sendToZautoRAG(converation, { role: lastMessage.role, content: lastMessage.content});
      this.server.to(client).emit('replyMessage', replay);
      //this.notifyAuthSubscribers(converation.id+'_messages', replay.orgInfo, replay);
    }
  }

  
  async handleDisconnect(client: Socket) {
    console.log('Client: ' + client.id + ' got disconnected...')
    try {
      const agentClient = await this.activeClientService.findByClient(client.id);
      if(agentClient) {
        console.log('Active Client Found for ' + client.id + ' Trying to handover to ')
        const conversation = await this.conversationService.findByAssignee(agentClient.userId);
        if(conversation && conversation.assigneeId && conversation.aiSuspended) {
          await this.conversationService.resumeAIAgent(conversation.id);
          await this.findReplayRequiredAndSend(conversation, client.id);
        }
        await this.activeClientService.deleteByClient(client.id);
      } else {
        console.log('Marking status to OFFLINE')
        const conv = await this.conversationService.updateStatusByClient(client.id, ConversationStatus.OFFLINE);
        if(conv) {
          console.log('Conversation is ' + conv._conversation.id + ' Is updated to OFFLINE.')
          await this.notifyAuthSubscribers('convStatusUpdate', conv._conversation.orgId, 
          {convId: conv._conversation.id, status: ConversationStatus.OFFLINE});
          this.redisPublisher.publish('updateSummary', JSON.stringify({id: conv._conversation.id}));
          this.redisPublisher.publish('endOfConversation', JSON.stringify({id: conv._conversation.id}));
        }
      }
    } catch(error) {
      console.error(error)
    }
  }

  async handleConnection(client: any, ...args: any[]) {
    console.log('Client Connected..' + client.id);
    try {
      if(client.handshake.headers.authorization) {
        const token = client.handshake.headers.authorization;
        // Extract the token value if it's a Bearer token
        const authToken = token?.split(' ')[1];
        const authInfo = await this.jwtService.verify(authToken);
      
        await this.activeClientService.create({
          userId: authInfo.userId,
          clientId: client.id,
          orgId: authInfo.orgId
        })
      } else if(client.handshake.query?.visitId) {
        const visitId = client.handshake.query?.visitId;
        if(visitId && visitId !== 'undefined') {
          const _conv = await this.conversationService.updateClientId(visitId, client.id);
          if(_conv) {
            await this.notifyAuthSubscribers('convStatusUpdate', _conv.orgId, 
            {convId: _conv.id, status: ConversationStatus.ONLINE});
          }
          
        }
      }
    } catch(error) {
      console.log(error)
    }
  }

  async notifyAuthSubscribers(eventName: string, orgId: string, message: any) {
    const activeClients = await this.activeClientService.findByOrg(orgId);
    for(let activeClient of activeClients) {
      this.server.to(activeClient.clientId).emit(eventName, message);
    }
  }

  @SubscribeMessage('ping')
  async ping(@MessageBody() message: any, @ConnectedSocket() client: Socket) {
    this.server.to(client.id).emit('pong', 'Socket Connected');
  }

  @SubscribeMessage('newMessage')
  onNewMessage(@MessageBody() message: any, @ConnectedSocket() client: Socket) {
    console.log(message)
    console.log(message.client)
    console.log(client.id)
    this.server.emit(message.client, message);
  }

  @SubscribeMessage('createConversation')
  async intConversation(@MessageBody() message: any, @ConnectedSocket() client: Socket) {
    if(!message.agentId) {
      this.server.to(client.id).emit('convCreateFailed', {message: "agentId is required."});
    } else {
      const conversation = await this.onInitConv(message, client.id);
      const currentDate = new Date().toISOString();
      const orgId = conversation.orgId;
      const messageUsage = await this.usageService.getMessageCount(orgId,currentDate);
      const remainingMessages = messageUsage.maxCount - messageUsage.count;

      if(remainingMessages <= 0)
      {
        this.server.to(client.id).emit('convCreateFailed', {message: "Unable to create conversation."});
      }
      else
      {
        // Emit the message to the specific client
        this.server.to(client.id).emit('convCreated', conversation);
        
        if(conversation.createdAt.getTime() > new Date().getTime() - (1000 * 60 * 3)) {
          await this.notifyAuthSubscribers('newConversation', conversation.orgId, conversation);
        }
        // Emit CTAs while creating conversation
        try {
          this.redisPublisher.publish('selectcta', JSON.stringify({clientId: client.id,
            convId: conversation.id, agentId: conversation.agentId}));
        } catch(error) {
          console.log(error)
        }
        
      }
    }
  }

  @SubscribeMessage('message')
  async onMessage(@MessageBody() message: any, @ConnectedSocket() client: Socket) {
    if(!message.agentId || !message.convId) {
      this.server.to(client.id).emit('messageFailed', 
      {message: {
        content: "agentId & convId are required.",
        role: 'assistant',
        type: MessageMediaType.ERROR
      }});
    } else {
      const flagged = await this.llmService.isContentFlagged(message.chatMessage?.messages[0]?.content);
      if(!flagged) { 
        const conversation = await this.onChatMessage(message) as any;
       
        if(conversation.message) {
          this.redisPublisher.publish('checklead', JSON.stringify({clientId: client.id,
            content: conversation.message.content, agentId: message.agentId}));
          this.redisPublisher.publish('checkcalendar', JSON.stringify({clientId: client.id,
            content: conversation.message.content, agentId: message.agentId, convId: message.convId}));
          this.redisPublisher.publish('selectcta', JSON.stringify({clientId: client.id,
            convId: message.convId, agentId: message.agentId}));
        }
        
        if(!conversation) {
          this.server.to(client.id).emit('messageFailed', {message: "agent not exist."});
        } else if(conversation.message && conversation.message.content && conversation.message.content == '<END_OF_CHAT>'){
          conversation.message.content = 'Thank you!'
          this.server.to(client.id).emit('replyMessage', conversation);
          this.server.to(client.id).emit('conversationEnded', {convId: message.convId});
          await this.notifyAuthSubscribers('conversationEnded', conversation.orgInfo, {convId: message.convId});
          this.conversationService.endConversation(message.convId);
        } else if(conversation.message && conversation.message.content && conversation.message.content.includes('<END_OF_CHAT>')){
          // Emit the message to the specific client
          this.server.to(client.id).emit('replyMessage', conversation);
          await this.notifyAuthSubscribers(message.convId+'_messages', conversation.orgInfo, conversation);
          this.server.to(client.id).emit('conversationEnded', {convId: message.convId});
          await this.notifyAuthSubscribers('conversationEnded', conversation.orgInfo, {convId: message.convId});
          this.conversationService.endConversation(message.convId);
        } else {
          // Emit the message to the specific client
          this.server.to(client.id).emit('replyMessage', conversation);
          await this.notifyAuthSubscribers(message.convId+'_messages', conversation.orgInfo, conversation);
          //this.redisPublisher.publish('generateStarters', JSON.stringify({clientId: client.id,
            //convId: message.convId, agentId: message.agentId}));
        }
      } else {
        console.error('Contnent is floagged.')
        this.server.to(client.id).emit('replyMessage', {message: {
          content: "These types of content are flagged.",
          role: 'assistant',
          type: MessageMediaType.WARNING
        }});
        //await this.notifyAuthSubscribers(message.convId+'_messages', conversation.orgInfo, conversation);
      }
    }
  }

  @SubscribeMessage('leadfound')
  async onLeadFound(@MessageBody() message: any, @ConnectedSocket() client: Socket) {
    if(message.clientId) {
      this.server.to(message.clientId).emit('leadfound', message);
    }
  }
  @SubscribeMessage('scheduleFound')
  async onScheduleFound(@MessageBody() message: any, @ConnectedSocket() client: Socket) {
    if(message.clientId) {
      this.server.to(message.clientId).emit('scheduleFound', message);
    }
  }

  @SubscribeMessage('ctaselected')
  async onCTASelect(@MessageBody() message: any, @ConnectedSocket() client: Socket) {
    if(message.clientId) {
      this.server.to(message.clientId).emit('ctaselected', message);
    }
  }

  @SubscribeMessage('avatarStatusUpdate')
  async onAvatarStatusUpdate(@MessageBody() message: any, @ConnectedSocket() client: Socket) {
    if(message.avatarId) {
      const eventName = `${message.avatarId}_avatarStatusUpdate`;
      this.server.emit(eventName, message);
    }
  }

  @SubscribeMessage('suspendAI')
  async suspendAIForConv(@MessageBody() message: any, @ConnectedSocket() client: Socket) {
    if(message.convId) {
      const activeClient = await this.activeClientService.findByClient(client.id)
      if(activeClient) {
        const convInfo = await this.conversationService.assignConvToHumanAgent(message.convId, activeClient.user)
        await this.notifyAuthSubscribers('aiSuspended', convInfo.conversation.orgId, convInfo.conversation);
        this.server.to(convInfo.conversation.socketId).emit('replyMessage', convInfo);
        this.server.to(convInfo.conversation.socketId).emit('aiSuspended', convInfo);
      }
    }
  }

  @SubscribeMessage('resumeAI')
  async resumeAIForConv(@MessageBody() message: any, @ConnectedSocket() client: Socket) {
    if(message.convId) {
      const activeClient = await this.activeClientService.findByClient(client.id)
      const convInfo = await this.conversationService.resumeAIAgent(message.convId, activeClient.user);
      await this.notifyAuthSubscribers('resumeAIAgent', convInfo.conversation.orgId, convInfo.conversation);
      this.server.to(convInfo.conversation.socketId).emit('resumeAIAgent', convInfo);
      this.server.to(convInfo.conversation.socketId).emit('replyMessage', convInfo);
      this.findReplayRequiredAndSend(convInfo.conversation, convInfo.conversation.socketId);
    }
  }

  @SubscribeMessage('messageByHuman')
  async messageFromHuman(@MessageBody() message: any, @ConnectedSocket() client: Socket) {
    if(message.convId) {
      const activeClient = await this.activeClientService.findByClient(client.id)
      if(activeClient) {
        const convInfo = await this.conversationService.sendByHuman(message.convId, activeClient.user, message)
        this.server.to(convInfo.conversation.socketId).emit('replyMessage', {message: convInfo.message});
        await this.notifyAuthSubscribers(message.convId+'_messages', convInfo.conversation.orgId, {message: convInfo.message});
      }
    }
  }

  @SubscribeMessage('requestHumanSupport')
  async requestHumanSupport(@MessageBody() message: any, @ConnectedSocket() client: Socket) {
    if(message.convId) {
      const lead = message.lead;
      const conversation = await this.conversationService.requestForHumanSupport(message.convId, lead)
      await this.notifyAuthSubscribers('customerRequest', conversation.orgId, {convId: conversation.id, name: lead.name});
    }
  }

  @SubscribeMessage('navigate')
  async onNavigate(@MessageBody() message: any, @ConnectedSocket() client: Socket) {
    console.log(message);
    if(!message) return;
    let greeting = await this.siteService.getGreetingByUrl(message.agentId,message.url);
    greeting = greeting + "<END_OF_CHAT>";
    const conversation = await this.conversationService.findOne(message.convId);
    const agent = await this.agentsService.findOne(message.agentId);
    if(conversation && agent)
    {
      const lastMessage = await this.conversationService.getLastMessage(conversation.id);
      let _message = null;
      if(lastMessage && lastMessage.content == greeting)
      {
        _message = lastMessage;
      }
      else
      {
        if(greeting.includes("null")) return;
        _message = await this.updateConversation({role:'assistant',content: greeting ? greeting : agent.welcomeMsg },conversation);
        this.conversationService.createNavigationActivity(conversation.id,message.url);
      }

      if(!_message) return;

      const convInfo = {message:_message,orgInfo: conversation.orgId};
      this.server.to(client.id).emit('replyMessage', convInfo);
      await this.notifyAuthSubscribers(message.convId+'_messages', convInfo.orgInfo, convInfo);
    }
  }

  @SubscribeMessage('updateNavigate')
  async onChange(@MessageBody() message: any, @ConnectedSocket() client: Socket) {
    if(!message && message.messageId && message.url)
    {
      this.conversationService.updateNavigationActivity(message.messageId,message.url);
    }
  }

  async onInitConv(message: any, clientId: string) {
    const agent = await this.agentsService.findOne(message.agentId);
    let visitor = null, visit = null;
    if(message.visitorId) {
      visitor = await this.visitorService.findOne(message.visitorId);
    }
    if(message.visitId) {
      visit = await this.visitorService.findVisit(message.visitId);
    }
    
    if(!agent) {
        return null
    }

    const converationObj = {
      agentId: agent.id,
      orgId: agent.orgId,
      type: ConversationType.CHAT,
      visitorId: visitor.id,
      visitId: visit.id,
      campaignId: visit.campaignId,
      socketId: clientId
    }

    //if agent uses openai assistant then create thread for the conversation
    if(agent.useAssistant) {
      const thread = await this.chatService.initChat()
      converationObj['threadId'] = thread.id
    }
    
    const converation = await this.conversationService.createIfNotExist(converationObj, agent.orgId, {
      role: 'assistant',
      content: agent.welcomeMsg
    })
    
    if(converation) {
      return {
        ...converation,
      };
    } else {
      return null;
    }
  }

  async onChatMessage(message: any) {
    try {
      const agentId = message.agentId;

      const conversation = await this.conversationService.findOneNoSummay(message.convId);
      
      if(conversation.status == ConversationStatus.OFFLINE) {
        const conv = await this.conversationService.updateStatus(conversation.id, ConversationStatus.ONLINE);
        await this.notifyAuthSubscribers('convStatusUpdate', conversation.orgId, {convId: message.convId, status: ConversationStatus.ONLINE});
      }
      
      if(conversation && conversation.agentId != agentId) {
        return {message: 'Not authorised to perform this acetion'};
      }

      // check lead from user message
      const _content = await this.leadFromUserMessage(message, conversation);
      
      if(_content)
        message.chatMessage.messages[0].content = _content;


      //If agent uses openai assistant then create thread for the conversation
      if(conversation.threadId 
        && conversation.agent.useAssistant
        && conversation.agent.assistantId) {
          if(!conversation.aiSuspended) {
            return await this.sendToZautoRAG(conversation, message.chatMessage.messages[0])
          } else {
            console.log('AI is suspended for this conversation: ' + conversation.id);
            const _message = await this.updateConversation(message.chatMessage.messages[0], conversation)
            await this.notifyAuthSubscribers(conversation.id+'_messages', conversation.orgId, {message: _message});
          }
      } else {
        if(!conversation.aiSuspended) {
          return await this.sendToZautoRAG(conversation, message.chatMessage.messages[0])
        } else {
          const _message = await this.updateConversation(message.chatMessage.messages[0], conversation)
          await this.notifyAuthSubscribers(conversation.id+'_messages', conversation.orgId, {message: _message});
        }
      }
    } catch(e) {
      console.log(e)
    }
  }

  //OpenAI Assistant System
  async sendToAssistant(conversation: any, message: ZautoChatCompletionMessage) {
    const _message = await this.updateConversation(message, conversation)

    await this.notifyAuthSubscribers(_message.convId+'_messages', conversation.orgId, {message: _message});

    const response = await this.chatService
      .chatWithAssistant(conversation.threadId, 
        conversation.agent.assistantId, message);
    
    const agentMessage = {
        role: response.data[0].role,
        content: response.data[0].content[0].text.value
    };
    const _agentMessage = await this.updateConversation(agentMessage, conversation);
    if(_agentMessage.content.includes('<END_OF_CHAT>') || _agentMessage.content.includes('<END_OF_CALL>')) {
      this.redisPublisher.publish('updateSummary', JSON.stringify({id: conversation.id}));
      this.redisPublisher.publish('endOfConversation', JSON.stringify({id: conversation.id}));
    }
    
    const agentResponse = {
      message: _agentMessage,
      orgInfo: conversation.orgId
    };
    return agentResponse;
  }


  //ZautoAI RAG System
  async sendToZautoRAG(conversation: any, message: ZautoChatCompletionMessage) {
    try {
      const _message = await this.updateConversation(message, conversation)
      let history = await this.conversationService.getMessages(conversation.id)

      await this.notifyAuthSubscribers(_message.convId+'_messages', conversation.orgId, {message: _message});

      const response = await this.chatService.chat(conversation.agent, history.map(message => {
        return {
          role: message.role,
          content: message.content
        }
      }));
        
      const agentMessage = {
            role: response.message.role,
            content: response.message.content
      };
      const _agentMessage = await this.updateConversation(agentMessage, conversation);
        if(_agentMessage.content.includes('<END_OF_CHAT>') || _agentMessage.content.includes('<END_OF_CALL>')) {
          this.redisPublisher.publish('updateSummary', JSON.stringify({id: conversation.id}));
          this.redisPublisher.publish('endOfConversation', JSON.stringify({id: conversation.id}));
      }
        
      const agentResponse = {
        message: _agentMessage,
        orgInfo: conversation.orgId
      };
      return agentResponse;
    } catch(error) {
      console.log(error)
    }
    
  }
 
  async updateConversation(message: ZautoChatCompletionMessage, {id, orgId, agentId, }) {
    const _messageObj = {
      orgId: orgId,
      agentId: agentId,
      convId: id,
      role: message.role,
      content: message.content
    }
    return await this.conversationService.createMessage(_messageObj);
  }

  async leadFromUserMessage(message, conversation) {
    let content = message.chatMessage.messages[0].content;
    const emailRegex = /([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
    const phoneRegex = /(\d{3}[-.\s]??\d{3}[-.\s]??\d{4}|\(\d{3}\)\s*\d{3}[-.\s]??\d{4}|\d{3}[-.\s]??\d{4})/g;
  
    const emails = content.match(emailRegex) || [];
    const phoneNumbers = content.match(phoneRegex) || [];
  
    if (emails.length > 0 || phoneNumbers.length > 0) {
      const maskedContent = content.replace(emailRegex, 'XXXX@$2'); // Replace local part with 'XXXX'
  
      if (maskedContent !== content) {
        const emailStr = emails.join(',');
        const phoneStr = phoneNumbers.join(',');
  
        await this.leadService.create({
          convId: conversation.id,
          agentId: conversation.agentId,
          mobile: phoneStr,
          email: emailStr,
        }, conversation.orgId);
        
        content = maskedContent;
      }
    }
    return content;
  }


  onModuleDestroy() {
    this.server.disconnectSockets();
  }
}
