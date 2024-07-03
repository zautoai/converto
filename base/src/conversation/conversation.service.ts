import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { SummarizerService } from 'src/assistants/services/summarizer.service';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { ServiceParams } from 'src/common/models/service-param.model';
import { BaseService } from 'src/common/services/base.service';
import { ContactsService } from 'src/contacts/contacts.service';
import { ZautoChatCompletionMessage } from 'src/llm/llms/llm.models';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { CreateMessageDto } from './dto/crete-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { ConversationStatus, Sentimental } from './entities/conversation.entity';
import { MessageMediaType } from './entities/conversation.enums';
import { SUMMARIZER_PROMPT } from 'src/common/templates/claude/summarizer.prompt.template';
import { LlmService } from 'src/llm/llm.service';

@Injectable()
export class ConversationService extends BaseService {

  constructor(private summarizer: SummarizerService, private contactsService: ContactsService,private readonly llmService: LlmService) {
    super();
  }

  async create(serviceParams: ServiceParams<CreateConversationDto>) {
    const { orgId, data: createConversationDto } = serviceParams;
    const prisma = await this.getPrismaClient(orgId);
    try {
      return await prisma.conversation.create({ data: createConversationDto });
    }
    catch (error) {
      throw error
    } finally {
      prisma.$disconnect()
      await this.closeConnection(orgId);
    }
  }

  async createIfNotExist(serviceParams: ServiceParams<{ createConversationDto: CreateConversationDto, message?: ZautoChatCompletionMessage }>,) {
    const { orgId, data: { createConversationDto, message } } = serviceParams;
    const prisma = await this.getPrismaClient(orgId);
    try {
      const conversation = await prisma.conversation.findFirst({
        where: {
          visitorId: createConversationDto.visitorId
        }
      })
      if (conversation) {
        return conversation;
      }
      const newConv = await prisma.conversation.create({ data: createConversationDto });
      if (message) {
        await this.createMessage({
          orgId, data: {
            convId: newConv.id,
            role: message.role,
            content: message.content
          }
        });
      }
      return newConv;
    } catch (error) {
      throw error
    } finally {
      prisma.$disconnect()
      await this.closeConnection(orgId);
    }
  }

  async findAll(serviceParams: ServiceParams<PaginationDto>) {
    const { orgId, data: paginationDto } = serviceParams;
    const { page, limit } = paginationDto;
    const skip = (page - 1) * limit;
    const prisma = await this.getPrismaClient(orgId);

    try {
      const roleData: any = await prisma.conversation.findMany({ skip, take: limit, include: { visitor: true, visit: true, campaign: true } });
      const total = await prisma.conversation.count();

      // Fetch and append contact data for each conversation
      for (const conversation of roleData) {
        const contacts = await this.contactsService.getContactsByConversation(orgId, conversation.id);
        conversation.contacts = contacts;
      }

      return {
        data: roleData,
        page: page,
        total: total,
      };
    } catch (error) {
      throw error;
    } finally {
      prisma.$disconnect();
      await this.closeConnection(orgId);
    }
  }

  async updateSummary(orgId: string, conversation: any, agent: any) {
    try {
      const _conv = await this.summarizer.getSummary(orgId, conversation, agent);
      // conversation.summary = _conv.summary;
      // conversation.sentimental = _conv.sentimental;
      // conversation.suggestions = _conv.suggestions
    } catch (error) {
    }

    return conversation;
  }

  async findOne(orgId: string, id: string) {
    const prisma = await this.getPrismaClient(orgId);
    try {
      let existingConversation: any = await prisma.conversation.findUnique({
        where: { id },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' }, include: {
              sentBy: {
                select: {
                  id: true,
                  name: true,
                  imgUrl: true
                }
              }
            }
          },
          campaign: true,
          visitor: true,
          visit: true
        }
      });
      if (existingConversation) {
        const contacts = await this.contactsService.getContactsByConversation(orgId, existingConversation.id);
        existingConversation.contacts = contacts;
        return existingConversation;
      } else throw new NotFoundException(`Conversation with id ${id} not found.`);
    } catch (error) {
      throw error
    } finally {
      prisma.$disconnect()
      await this.closeConnection(orgId);
    }
  }

  async findOneWithSummary(orgId: string, id: string) {
    const prisma = await this.getPrismaClient(orgId);
    try {
      let existingConversation: any = await prisma.conversation.findUnique({
        where: { id },
        include: {
          messages: {
            where: { type: 'TEXT' },
            orderBy: { createdAt: 'asc' }, include: {
              sentBy: {
                select: {
                  id: true,
                  name: true,
                  imgUrl: true
                }
              }
            }
          }
        }
      });
      const agent = await prisma.agent.findFirst()
      if (existingConversation) {
        const lastMessageOn = existingConversation.messages[existingConversation.messages.length - 1]?.modifiedAt.getTime();
        if (!existingConversation.summaryUpdatedAt || lastMessageOn && lastMessageOn > existingConversation.summaryUpdatedAt.getTime()) {
          existingConversation = await this.updateSummary(orgId, existingConversation, agent);
        }
        const contacts = await this.contactsService.getContactsByConversation(orgId, existingConversation.id);
        existingConversation.contacts = contacts;
        return existingConversation;
      } else throw new NotFoundException(`Conversation with id ${id} not found.`);
    } catch (error) {
      throw error
    } finally {
      prisma.$disconnect()
      await this.closeConnection(orgId);
    }
  }

  async findOneNoSummay(orgId: string, id: string) {
    const prisma = await this.getPrismaClient(orgId);
    try {
      let existingConversation: any = await prisma.conversation.findUnique({
        where: { id },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' }, include: {
              sentBy: {
                select: {
                  id: true,
                  name: true,
                  imgUrl: true
                }
              }
            }
          },
          campaign: true,
          visitor: true,
          visit: true
        }
      });
      if (existingConversation) {
        const contacts = await this.contactsService.getContactsByConversation(orgId, existingConversation.id);
        existingConversation.contacts = contacts;
        return existingConversation;
      } else throw new NotFoundException(`Conversation with id ${id} not found.`);
    } catch (error) {
      throw error
    } finally {
      prisma.$disconnect()
      await this.closeConnection(orgId);
    }
  }

  // async update(id: string, updateConversationDto: any) {
  //   const existingConversation = await this.prisma.conversation.findUnique({where: {id}});
  //   if(existingConversation) {
  //     return await this.prisma.conversation.update({data: updateConversationDto, where:{id}});
  //   } else throw new NotFoundException(`Conversation with id ${id} not found.`);
  // }

  async remove(orgId: string, id: string) {
    const prisma = await this.getPrismaClient(orgId);
    try {
      const existingConversation = await prisma.conversation.findUnique({ where: { id } });
      if (existingConversation) {
        return await prisma.conversation.delete({ where: { id } })
      } else throw new NotFoundException(`Conversation with id ${id} not found.`);
    } catch (error) {
      throw error
    } finally {
      prisma.$disconnect()
      await this.closeConnection(orgId);
    }
  }

  async updateStatusByClient(serviceParams: ServiceParams<{ socketId: string, status: ConversationStatus }>) {
    const { orgId, data: { socketId, status } } = serviceParams;
    const prisma = await this.getPrismaClient(orgId);
    try {
      const conversation = await prisma.conversation.findFirst({ where: { socketId } });
      if (conversation) {
        const _conversation = await prisma.conversation.update({
          data: {
            status
          }, where: { socketId }
        });
        return {
          _conversation,
          currentStatus: _conversation.status,
          previousStatus: conversation.status
        }
      }
      return null;
    } catch (error) {
      throw error
    } finally {
      prisma.$disconnect()
      await this.closeConnection(orgId);
    }
  }

  async updateStatus(serviceParams: ServiceParams<{ id: string, status: ConversationStatus }>) {
    const { orgId, data: { id, status } } = serviceParams;
    const prisma = await this.getPrismaClient(orgId);
    try {
      const _conversation = await prisma.conversation.update({
        data: {
          status
        }, where: { id }
      });
      return _conversation;
    } catch (error) {
      throw error
    } finally {
      prisma.$disconnect()
      await this.closeConnection(orgId);
    }
  }

  async endConversation(orgId: string, id: string) {
    const prisma = await this.getPrismaClient(orgId);
    try {
      const _conversation = await prisma.conversation.update({
        data: {
          isEnded: true
        }, where: { id }
      });
      return _conversation;
    } catch (error) {
      throw error
    } finally {
      prisma.$disconnect()
      await this.closeConnection(orgId);
    }
  }

  async updateClientId(serviceParams: ServiceParams<{ visitId: string, socketId: string }>) {
    const { orgId, data: { visitId, socketId } } = serviceParams;
    const prisma = await this.getPrismaClient(orgId);
    try {
      const _conversation = await prisma.conversation.update({
        data: {
          socketId, status: ConversationStatus.ONLINE
        }, where: { visitId }
      });
      return _conversation;
    } catch (error) {
      throw error
    } finally {
      prisma.$disconnect()
      await this.closeConnection(orgId);
    }
  }

  async assignConvToHumanAgent(serviceParams: ServiceParams<{ id: string, user: any }>) {
    const { orgId, data: { id, user } } = serviceParams;
    const prisma = await this.getPrismaClient(orgId);
    try {
      const conversation = await this.findOneNoSummay(orgId, id)
      if (conversation) {
        const agent = await prisma.agent.findFirst();
        if (!agent) {
          throw new Error("No agent found");
        }
        await prisma.conversation.update({ data: { aiSuspended: true, assigneeId: user.id }, where: { id } })
        const message = await this.createMessage({
          orgId, data: {
            convId: conversation.id,
            role: 'assistant',
            content: `${user.name} has joined in the chat. AI ${agent.displayName} is Off.`,
            type: MessageMediaType.ACTIVITY,
            sentById: user.id,

          }
        })
        return {
          conversation,
          message,
          user
        }
      }
      return null;

    } catch (error) {
      throw error
    } finally {
      prisma.$disconnect()
      await this.closeConnection(orgId);
    }
  }

  async sendByHuman(serviceParams: ServiceParams<{ id: string, user: any, _message: any }>) {
    const { orgId, data: { id, user, _message } } = serviceParams;
    const prisma = await this.getPrismaClient(orgId);
    try {
      const conversation = await this.findOneNoSummay(orgId, id)
      if (conversation) {
        await prisma.conversation.update({ data: { aiSuspended: true, assigneeId: user.id }, where: { id } })
        const message = await this.createMessage({
          orgId, data: {
            convId: conversation.id,
            role: 'assistant',
            content: _message.content,
            type: MessageMediaType.TEXT,
            sentById: user.id
          }
        })
        return {
          conversation,
          message,
          user
        }
      }
      return null;

    } catch (error) {
      throw error
    } finally {
      prisma.$disconnect()
      await this.closeConnection(orgId);
    }
  }

  async resumeAIAgent(serviceParams: ServiceParams<{ id: string, user?: any }>) {
    const { orgId, data: { id, user } } = serviceParams;
    const prisma = await this.getPrismaClient(orgId);
    try {
      const conversation = await this.findOneNoSummay(orgId, id)
      if (conversation) {
        const agent = await prisma.agent.findFirst();
        if (!agent) {
          throw new Error("No agent found");
        }
        await prisma.conversation.update({ data: { aiSuspended: false }, where: { id } })
        const message = await this.createMessage({
          orgId, data: {
            convId: conversation.id,
            role: 'assistant',
            content: `AI ${agent.displayName} is online to assist you.`,
            type: MessageMediaType.ACTIVITY,
            sentById: user?.id
          }
        })
        return {
          conversation,
          message
        }
      }
      return null;

    } catch (error) {
      throw error
    } finally {
      prisma.$disconnect()
      await this.closeConnection(orgId);
    }
  }

  async requestForHumanSupport(serviceParams: ServiceParams<{ id: string, lead?: any }>) {
    const { orgId, data: { id, lead } } = serviceParams;
    const prisma = await this.getPrismaClient(orgId);
    try {
      const conversation = await this.findOneNoSummay(orgId, id)
      if (conversation) {
        await this.createMessage({
          orgId, data: {
            convId: conversation.id,
            role: 'user',
            content: 'I need Human Agent Support.',
            type: MessageMediaType.ACTIVITY
          }
        })
      }
      if (lead) {
        await this.addLead({ orgId, data: { conversation, lead } });
      }
      return conversation;
    } catch (error) {
      throw error
    } finally {
      prisma.$disconnect()
      await this.closeConnection(orgId);
    }
  }

  async addLead(serviceParams: ServiceParams<{ conversation: any, lead: any }>) {
    const { orgId, data: { conversation, lead } } = serviceParams;
    const prisma = await this.getPrismaClient(orgId);
    try {
      const _convlead = await this.contactsService.getContactsByConversation(orgId, conversation.id);
      if (_convlead) {
        const _lead = await this.contactsService.update(orgId, _convlead[0].id, lead);
      }
      else {
        const _lead = await this.contactsService.create(orgId, lead)
      }
    } catch (error) {
      throw error
    } finally {
      prisma.$disconnect()
      await this.closeConnection(orgId);
    }
  }

  async createMessage(serviceParams: ServiceParams<CreateMessageDto>) {
    const { orgId, data: createMessageDto } = serviceParams;
    const prisma = await this.getPrismaClient(orgId);
    try {
      const message = await prisma.zautoMessage.create({ data: createMessageDto });
      const count = await prisma.zautoMessage.count({ where: { convId: createMessageDto.convId, type: 'TEXT' } });
      if (count > 3) {
        await prisma.conversation.update({ data: { isValid: true }, where: { id: createMessageDto.convId } })
      }
      return message;
    } catch (error) {
      throw new InternalServerErrorException('Unalbe to create Message')
    } finally {
      prisma.$disconnect()
      await this.closeConnection(orgId);
    }
  }

  async updateMessage(serviceParams: ServiceParams<{ id: string, updateMessageDto: UpdateMessageDto }>) {
    const { orgId, data: { id, updateMessageDto } } = serviceParams;
    const prisma = await this.getPrismaClient(orgId);
    try {
      const message = prisma.zautoMessage.update({ data: updateMessageDto, where: { id } });
      return message;
    } catch (error) {
      throw new InternalServerErrorException('Unalbe to create Message')
    } finally {
      prisma.$disconnect()
      await this.closeConnection(orgId);
    }
  }

  async getMessages(orgId: string, convId: string) {
    const prisma = await this.getPrismaClient(orgId);
    try {
      const messages = await prisma.zautoMessage.findMany({
        where: { convId },
        orderBy: { createdAt: 'asc' },
        include: {
          sentBy: {
            select: {
              id: true,
              name: true,
              imgUrl: true
            }
          }
        }
      });
      return messages;
    } catch (error) {
      throw new InternalServerErrorException('Unalbe to create Message')
    } finally {
      prisma.$disconnect()
      await this.closeConnection(orgId);
    }
  }

  async findByAssignee(orgId: string, assigneeId: string) {
    const prisma = await this.getPrismaClient(orgId);
    return await prisma.conversation.findFirst({ where: { assigneeId } });
  }

  async getLastMessage(orgId: string, convId: string) {
    const prisma = await this.getPrismaClient(orgId);
    try {
      const lastMessage = await prisma.zautoMessage.findFirst({
        where: { convId, type: "TEXT" },
        orderBy: { createdAt: 'desc' },
        include: {
          sentBy: {
            select: {
              id: true,
              name: true,
              imgUrl: true
            }
          }
        }
      });
      return lastMessage;
    } catch (error) {
      throw new InternalServerErrorException('Unable to fetch last message');
    } finally {
      prisma.$disconnect()
      await this.closeConnection(orgId);
    }
  }

  async createNavigationActivity(serviceParams: ServiceParams<{ convId: string, url: string }>) {
    const { orgId, data: { convId, url } } = serviceParams;
    try {
      const conversation = await this.findOne(orgId, convId);
      if (conversation) {
        const message = await this.createMessage({
          orgId, data: {
            convId: conversation.id,
            role: 'user',
            content: `Navigated to ${url}`,
            type: MessageMediaType.NAVIGATION,
          }
        })
        return {
          conversation,
          message,
        }
      }
      return null;

    } catch (error) {
      console.error(error)
    }
  }

  async updateNavigationActivity(serviceParams: ServiceParams<{ messageId: string, url: string }>) {
    const { orgId, data: { messageId, url } } = serviceParams;
    const prisma = await this.getPrismaClient(orgId);
    try {
      const message = await prisma.zautoMessage.update({
        data: {
          role: 'user',
          content: `Left from ${url}`,
          type: MessageMediaType.ACTIVITY,
        }, where: { id: messageId }
      })
      return {
        message,
      }

    } catch (error) {
      throw error
    } finally {
      prisma.$disconnect()
      await this.closeConnection(orgId);
    }
  }

  async generateSummary(orgId: string, id: string) {
    const prisma = await this.getPrismaClient(orgId);
    try {
      const conversation = await this.findOne(orgId, id);
      const agent = await prisma.agent.findFirst();
      let summarizerPrompt = SUMMARIZER_PROMPT;
      const customerName = conversation.contacts?.fullName ? conversation.contacts?.fullName : 'Anonymous Customer';
      const messages = []
      for (let message of conversation.messages) {
        messages.push({
          role: message.role == 'assistant' ? agent?.displayName : customerName,
          content: message.content
        });
      }
      const content = `BDR Name: ${agent?.name}
            Customer Name: ${customerName}
            Here is the chat conversation:
            ${JSON.stringify(messages)}`;

      const promptMesssage = [
        { role: 'system', content: summarizerPrompt },
        { role: 'user', content: content }
      ];
      const result = await this.llmService.chat(promptMesssage);

      let summaryJson = undefined
      if (result.content.includes('```json')) {
          summaryJson = this.extractJsonFromMarkdown(result.content);
      } else {
          summaryJson = JSON.parse(result.content);
      }

      if (summaryJson) {
        let taskList = '';
        if (Array.isArray(summaryJson.taskList)) {
          for (let [index, task] of summaryJson.taskList.entries()) {
            if (task.startsWith(`${index + 1}`))
              taskList += `${task}\n`;
            else taskList += `${index + 1}. ${task}\n`;
          }
        } else {
          taskList = summaryJson.taskList;
        }

        let summaryList = '';

        if (Array.isArray(summaryJson.summary)) {
          for (let [index, summary] of summaryJson.summary.entries()) {
            if (summary.startsWith(`${index + 1}`))
              summaryList += `${summary}\n`;
            else summaryList += `${index + 1}. ${summary}\n`;
          }
        } else {
          summaryList = summaryJson.summary;
        }

        return await prisma.conversation.update({
          where: { id: conversation.id },
          data: {
            summary: summaryList,
            sentimental: Sentimental[summaryJson.sentimental.toUpperCase()],
            taskList: taskList,
            potentialLevel: summaryJson.potentialLevel.toUpperCase(),
            summaryUpdatedAt: new Date()
          }
        });
      }
    } catch (error) {
      throw error
    } finally {
      prisma.$disconnect()
      await this.closeConnection(orgId);
    }
  }

  extractJsonFromMarkdown(mdContent: string) {
    // Regular expression to match a JSON block within Markdown
    const jsonRegex = /```json([\s\S]*?)```/;

    // Extract JSON string
    const match = mdContent.match(jsonRegex);

    if (match && match[1]) {
        // Clean up whitespace and parse JSON
        try {
            const jsonString = match[1].trim();
            return JSON.parse(jsonString);
        } catch (e) {
            console.error('Failed to parse JSON:', e);
            return null;
        }
    } else {
        console.error('No JSON content found');
        return null;
    }
}

}
