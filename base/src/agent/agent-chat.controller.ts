import { Controller, Get, Post, Body, Param, InternalServerErrorException, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { AgentService } from './agent.service';
import { Agent } from './entities/agent.entity';
import { ApiBody, ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { ChatMessage } from './dto/chat.dto';
import { ConversationService } from 'src/conversation/conversation.service';
import { ConversationType } from 'src/common/enums/enums';
import { ChatService } from './agent-chat.service';
import { SubdomainGuard } from 'src/common/guard/subdomain/subdomain.guard';
import { SubdomainRequest } from 'src/common/models/subdomain-request.model';


@ApiTags('Agents')
@Controller('api/agents/:agentId/chat')
export class AgentChatController {
  
  constructor(private readonly agentsService: AgentService,
    private readonly conversationService: ConversationService,
    private readonly chatService: ChatService) {}


  // @Post()
  // @ApiBody({ type: ChatMessage })
  // @ApiCreatedResponse({type: Agent})
  // async create(@Param('agentId') agentId: string, 
  // @Body() chatMessage: ChatMessage, @Req() request: Request) {
  //   console.log(request)
  //   const agent = await this.agentsService.findOne(agentId);
    
  //   const converationObj = {
  //     agentId: agentId,
  //     type: ConversationType.CHAT,
  //     history: JSON.stringify(chatMessage.messages)
  //   }
  //   if(agent.useAssistant) {
  //     const thread = await this.chatService.initChat()
  //     converationObj['threadId'] = thread.id
  //   }
    
  //   const converation = await this.conversationService.create(converationObj, agent.orgId)
  //   if(converation) {
  //     return {
  //       message: [],
  //       convId: converation.id,
  //     }
  //   } else {
  //     throw new InternalServerErrorException('Unable to initiate the chat.')
  //   }
  // }

  // @Post(':convId')
  // @ApiBody({ type: ChatMessage })
  // @ApiCreatedResponse({type: Agent})
  // async replay(@Param('convId') conversationId: string, 
  // @Param('agentId') agentId: string, 
  // @Body() chatMessage: ChatMessage, @Req() request: Request) {
  //   const conversation = await this.conversationService.findOne(conversationId);
  //   if(!conversation) {
  //     return await this.create(agentId, chatMessage, request);
  //   } 
  //   if(conversation && conversation.agentId != agentId) {
  //     throw new UnauthorizedException('You are not authorized to access this conversation.')
  //   }
  //   let history = JSON.parse(conversation.history);
  //   history.push(chatMessage.messages[0]);
  
  //   const latestMessage = history.slice(1);
  //   // Get the last 4 objects from the remaining array
  //   const lastFourObjects = latestMessage.slice(-4);
  //   const response = await this.chatService.chat(conversation.agent, latestMessage.slice(-4));
  //   this.updateConversation(response, conversationId);
  //   return {
  //     message: response.message
  //   }
  // }

  @Get(':convId')
  @ApiCreatedResponse({type: Agent})
  @UseGuards(SubdomainGuard)
  async fetchMessages(@Param('convId') conversationId: string, @Param('agentId') agentId: string, @Req() request: SubdomainRequest) {
    const orgId = request.orgId;
    const conversation = await this.conversationService.findOneNoSummay(orgId,conversationId);
    if(conversation ) {
      throw new UnauthorizedException('You are not authorized to access this conversation.')
    }
    let history = await this.conversationService.getMessages(orgId,conversationId);
    return history;
  }

  // async updateConversation(response: any, convId: string) {
  //   response.history.push(response.message)
  //   this.conversationService.update(convId, {history: JSON.stringify(response.history)})
  // }


}
