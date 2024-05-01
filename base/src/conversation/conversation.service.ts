import { Injectable, InternalServerErrorException, NotAcceptableException, NotFoundException } from '@nestjs/common';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { CreateMessageDto } from './dto/crete-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { ConversationFilterDto } from './dto/conversation-filter.dto';
import { Conversation, ConversationStatus } from './entities/conversation.entity';
import { User } from 'src/users/entities/user.entity';
import { MessageMediaType } from './entities/conversation.enums';
import { SummarizerService } from 'src/assistants/services/summarizer.service';
import { ZautoChatCompletionMessage } from 'src/llm/llms/llm.models';
import { LeadService } from 'src/lead/lead.service';
import { UsageService } from 'src/account/usage.service';

@Injectable()
export class ConversationService {

  constructor(private prisma: PrismaService,
    private summarizer: SummarizerService,
    private readonly usageService: UsageService) { }

  async create(createConversationDto: CreateConversationDto, orgId: string) {
    const currentDate = new Date().toISOString();
    const conversationUsage = await this.usageService.getConversationCount(orgId, currentDate);
    const remainingConversation = conversationUsage.maxCount - conversationUsage.count;

    if (remainingConversation <= 0) {
      throw new NotAcceptableException(`Remaining conversations ${remainingConversation}`);
    }
    return await this.prisma.conversation.create({ data: { ...createConversationDto, orgId } });
  }

  async createIfNotExist(createConversationDto: CreateConversationDto, orgId: string, message?: ZautoChatCompletionMessage) {
    const conversation = await this.prisma.conversation.findFirst({
      where: {
        orgId,
        agentId: createConversationDto.agentId,
        // visitId: createConversationDto.visitId,
        visitorId: createConversationDto.visitorId
      }
    })
    if (conversation) {
      return conversation;
    }
    const newConv = await this.prisma.conversation.create({ data: { ...createConversationDto, orgId } });
    if (message) {
      await this.createMessage({
        orgId,
        agentId: createConversationDto.agentId,
        convId: newConv.id,
        role: message.role,
        content: message.content
      });
    }
    return newConv;
  }

  async findAll(paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;
    const skip = (page - 1) * limit;
    const roleData = await this.prisma.conversation.findMany({ skip, take: limit });
    const total = await this.prisma.conversation.count();
    return {
      data: roleData,
      page: page,
      total: total
    };
  }

  async findAllByagentId(agentId: string, paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;
    const skip = (page - 1) * limit;
    const roleData = await this.prisma.conversation.findMany({ skip, take: limit, where: { agentId }, include: { Lead: true } });
    const total = await this.prisma.conversation.count({ where: { agentId } });
    return {
      data: roleData,
      page: page,
      total: total
    };
  }

  async findAllByOrg(orgId: string, filterDto: ConversationFilterDto) {
    const { page, limit } = filterDto;
    const skip = (page - 1) * limit;
    const roleData = await this.prisma.conversation.findMany({
      skip,
      take: limit,
      orderBy: { modifiedAt: 'desc' },
      where: {
        orgId,
        ...filterDto.campaign ? { campaignId: { equals: filterDto.campaign } } : {},
        ...filterDto.fromDate ? { modifiedAt: { gte: filterDto.fromDate, lte: filterDto.toDate } } : {},
        ...filterDto.status ? { status: { equals: ConversationStatus[filterDto.status] } } : {},
        ...filterDto.lead ? { Lead: { isNot: null } } : {},
        isValid: true
      },
      include: {
        Lead: true,
        visitor: true,
        campaign: true,
        visit: true,
        assignee: {
          select: {
            id: true,
            name: true,
            imgUrl: true
          }
        },
        messages: {
          where: { type: 'TEXT' },
        }
      }
    });
    const total = await this.prisma.conversation.count({
      where: {
        orgId,
        ...filterDto.campaign ? { campaignId: { equals: filterDto.campaign } } : {},
        ...filterDto.fromDate ? { modifiedAt: { gte: filterDto.fromDate, lte: filterDto.toDate } } : {},
        ...filterDto.status ? { status: { equals: ConversationStatus[filterDto.status] } } : {},
        ...filterDto.lead ? { Lead: { isNot: null } } : {},
        isValid: true
      },
    });
    return {
      data: roleData,
      page: page,
      total: total
    };
  }

  async updateSummary(conversation: any) {
    try {
      const _conv = await this.summarizer.getSummary(conversation);
      conversation.summary = _conv.summary;
      conversation.sentimental = _conv.sentimental;
      conversation.suggestions = _conv.suggestions
    } catch (error) {
    }

    return conversation;
  }

  async findOne(id: string) {
    let existingConversation = await this.prisma.conversation.findUnique({
      where: { id },
      include: {
        agent: true, messages: {
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
        Lead: true,
        visitor: true,
        visit: true
      }
    });
    if (existingConversation) {
      return existingConversation;
    } else throw new NotFoundException(`Conversation with id ${id} not found.`);
  }

  async findOneWithSummary(id: string) {
    let existingConversation = await this.prisma.conversation.findUnique({
      where: { id },
      include: {
        agent: true, messages: {
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
        },
        Lead: { include: {LeadCategoryMap: { include: {category: true}}}},
      }
    });
    if (existingConversation) {
      const lastMessageOn = existingConversation.messages[existingConversation.messages.length - 1]?.modifiedAt.getTime();
      if (!existingConversation.summaryUpdatedAt || lastMessageOn && lastMessageOn > existingConversation.summaryUpdatedAt.getTime()) {
        existingConversation = await this.updateSummary(existingConversation);
      }
      return existingConversation;
    } else throw new NotFoundException(`Conversation with id ${id} not found.`);
  }

  async findOneNoSummay(id: string) {
    let existingConversation = await this.prisma.conversation.findUnique({
      where: { id },
      include: {
        agent: true, messages: {
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
        Lead: true,
        visitor: true,
        visit: true
      }
    });
    if (existingConversation) {
      return existingConversation;
    } else throw new NotFoundException(`Conversation with id ${id} not found.`);
  }

  // async update(id: string, updateConversationDto: any) {
  //   const existingConversation = await this.prisma.conversation.findUnique({where: {id}});
  //   if(existingConversation) {
  //     return await this.prisma.conversation.update({data: updateConversationDto, where:{id}});
  //   } else throw new NotFoundException(`Conversation with id ${id} not found.`);
  // }

  async remove(id: string) {
    const existingConversation = await this.prisma.conversation.findUnique({ where: { id } });
    if (existingConversation) {
      return await this.prisma.conversation.delete({ where: { id } })
    } else throw new NotFoundException(`Conversation with id ${id} not found.`);
  }

  async updateStatusByClient(socketId: string, status: ConversationStatus) {
    try {
      const conversation = await this.prisma.conversation.findFirst({ where: { socketId } });
      if (conversation) {
        const _conversation = await this.prisma.conversation.update({
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
      console.error(error)
    }
  }

  async updateStatus(id: string, status: ConversationStatus) {
    try {
      const _conversation = await this.prisma.conversation.update({
        data: {
          status
        }, where: { id }
      });
      return _conversation;
    } catch (error) {
      console.error(error)
    }
  }

  async endConversation(id: string) {
    try {
      const _conversation = await this.prisma.conversation.update({
        data: {
          isEnded: true
        }, where: { id }
      });
      return _conversation;
    } catch (error) {
      console.error(error)
    }
  }

  async updateClientId(visitId: string, socketId: string) {
    try {
      const _conversation = await this.prisma.conversation.update({
        data: {
          socketId, status: ConversationStatus.ONLINE
        }, where: { visitId }
      });
      return _conversation;
    } catch (error) {
      console.error(error)
    }
  }

  async assignConvToHumanAgent(id: string, user: any) {
    try {
      const conversation = await this.findOneNoSummay(id)
      if (conversation) {
        await this.prisma.conversation.update({ data: { aiSuspended: true, assigneeId: user.id }, where: { id } })
        const message = await this.createMessage({
          convId: conversation.id,
          orgId: conversation.orgId,
          agentId: conversation.agentId,
          role: 'assistant',
          content: `${user.name} has joined in the chat. AI ${conversation.agent.displayName} is Off.`,
          type: MessageMediaType.ACTIVITY,
          sentById: user.id
        })
        return {
          conversation,
          message,
          user
        }
      }
      return null;

    } catch (error) {
      console.error(error)
    }
  }

  async sendByHuman(id: string, user: any, _message: any) {
    try {
      const conversation = await this.findOneNoSummay(id)
      if (conversation) {
        await this.prisma.conversation.update({ data: { aiSuspended: true, assigneeId: user.id }, where: { id } })
        const message = await this.createMessage({
          convId: conversation.id,
          orgId: conversation.orgId,
          agentId: conversation.agentId,
          role: 'assistant',
          content: _message.content,
          type: MessageMediaType.TEXT,
          sentById: user.id
        })
        return {
          conversation,
          message,
          user
        }
      }
      return null;

    } catch (error) {
      console.error(error)
    }
  }

  async resumeAIAgent(id: string, user?: any) {
    try {
      const conversation = await this.findOneNoSummay(id)
      if (conversation) {
        await this.prisma.conversation.update({ data: { aiSuspended: false }, where: { id } })
        const message = await this.createMessage({
          convId: conversation.id,
          orgId: conversation.orgId,
          agentId: conversation.agentId,
          role: 'assistant',
          content: `AI ${conversation.agent.displayName} is online to assist you.`,
          type: MessageMediaType.ACTIVITY,
          sentById: user?.id
        })
        return {
          conversation,
          message
        }
      }
      return null;

    } catch (error) {
      console.error(error)
    }
  }

  async requestForHumanSupport(id: string, lead?: any) {
    try {
      const conversation = await this.findOneNoSummay(id)
      if (conversation) {
        await this.createMessage({
          convId: conversation.id,
          orgId: conversation.orgId,
          agentId: conversation.agentId,
          role: 'user',
          content: 'I need Human Agent Support.',
          type: MessageMediaType.ACTIVITY
        })
      }
      if (lead) {
        await this.addLead(conversation, lead);
      }
      return conversation;
    } catch (error) {
      console.error(error)
    }
  }

  async addLead(conversation: any, lead: any) {
    try {
      const _lead = await this.prisma.lead.findFirst({ where: { convId: conversation.id } });
      if (_lead) {
        return await this.prisma.lead.update({ data: { ..._lead, orgId: conversation.orgId }, where: { id: _lead.id } })
      } else {
        return await this.prisma.lead.create({
          data:
            { ...lead, orgId: conversation.orgId, convId: conversation.id, agentId: conversation.agentId }
        });
      }
    } catch (error) {
      throw new InternalServerErrorException(error)
    }
  }

  async createMessage(createMessageDto: CreateMessageDto) {
    try {
      const message = await this.prisma.zautoMessage.create({ data: createMessageDto });
      const count = await this.prisma.zautoMessage.count({ where: { convId: createMessageDto.convId, type:'TEXT' } });
      if(count > 3) {
        await this.prisma.conversation.update({ data: { isValid: true }, where: { id: createMessageDto.convId } })
      }
      return message;
    } catch (error) {
      throw new InternalServerErrorException('Unalbe to create Message')
    }
  }

  async updateMessage(id: string, updateMessageDto: UpdateMessageDto) {
    try {
      const message = this.prisma.zautoMessage.update({ data: updateMessageDto, where: { id } });
      return message;
    } catch (error) {
      throw new InternalServerErrorException('Unalbe to create Message')
    }
  }

  async getMessages(convId: string) {
    try {
      const messages = await this.prisma.zautoMessage.findMany({
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
    }
  }

  async findByAssignee(assigneeId: string) {
    return await this.prisma.conversation.findFirst({ where: { assigneeId } });
  }

  async getLastMessage(convId: string) {
    try {
      const lastMessage = await this.prisma.zautoMessage.findFirst({
        where: { convId , type: "TEXT"},
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
    }
  }

  async createNavigationActivity(convId: string,url: string)
  {
    try {
      const conversation = await this.findOne(convId);
      if (conversation) {
        const message = await this.createMessage({
          convId: conversation.id,
          orgId: conversation.orgId,
          agentId: conversation.agentId,
          role: 'user',
          content: `Navigated to ${url}`,
          type: MessageMediaType.NAVIGATION,
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

  async updateNavigationActivity(messageId: string, url: string)
  {
    try {
      const message = await this.prisma.zautoMessage.update({ data: {
        role: 'user',
        content: `Left from ${url}`,
        type: MessageMediaType.ACTIVITY,
      }, where: {id: messageId}})
      return {
        message,
      }

    } catch (error) {
      console.error(error)
    }
  }
}
