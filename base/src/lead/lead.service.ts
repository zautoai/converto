import {
  BadRequestException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { EmailService } from 'src/common/services/email.service';
import { ValidateEmailDto } from './dto/validate-email.dto';
import { ContactService } from 'src/microservices/crm_service/contact.service';

@Injectable()
export class LeadService {
  constructor(
    private prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly contactService: ContactService,
  ) {}

  getFirstKeyValue(obj) {
    let keys = Object.keys(obj);
    let values = Object.values(obj);

    if (keys.length === 0) {
      return 'Object is empty';
    }

    let firstKey = keys[0];
    let firstValue = values[0];

    return { firstKey, firstValue };
  }

  getInfoJsonStr(lead: any, info: string) {
    const currentInfo = JSON.parse(info);
    const leadInfo = JSON.parse(lead.info);
    return JSON.stringify({ ...currentInfo, ...leadInfo });
  }

  async mergeConversations(currentConv: string, email: string) {}

  async create(createLeadDto: CreateLeadDto, orgId: string) {
    try {
      const lead = await this.prisma.lead.findFirst({
        where: { convId: createLeadDto.convId },
      });
      if (lead) {
        if (lead.name && !createLeadDto.name) {
          createLeadDto.name = lead.name;
        }
        if (lead.mobile && !createLeadDto.mobile) {
          createLeadDto.mobile = lead.mobile;
        }

        if (createLeadDto.email) {
          const isValidEmail = await this.emailService.validateEmailDomain(
            createLeadDto.email,
          );
          if (!isValidEmail) {
            throw new BadRequestException(
              `The email address "${createLeadDto.email}" is invalid or not allowed.`,
            );
          }
          const _existingLead = await this.prisma.lead.findFirst({
            where: { email: createLeadDto.email, orgId },
          });
          if (_existingLead && _existingLead.convId != createLeadDto.convId) {
            let leadcopy = JSON.parse(JSON.stringify(createLeadDto));
            await this.prisma.lead.delete({ where: { id: _existingLead.id } });
            await this.prisma.zautoMessage.updateMany({
              where: { convId: _existingLead.convId },
              data: { convId: createLeadDto.convId },
            });
            createLeadDto = {
              ..._existingLead,
              ...leadcopy,
              email: leadcopy.email,
            };
            await this.prisma.conversation.delete({
              where: { id: _existingLead.convId },
            });
          } else if (lead.email && !createLeadDto.email) {
            createLeadDto.email = lead.email;
          }
          if (createLeadDto.info)
            createLeadDto.info = this.getInfoJsonStr(lead, createLeadDto.info);
        }
        return await this.prisma.lead.update({
          data: { ...createLeadDto, orgId },
          where: { id: lead.id },
        });
      } else {
        if (!createLeadDto.name && createLeadDto.info) {
          let infoJson = JSON.parse(createLeadDto.info);
          createLeadDto.name = this.getFirstKeyValue(infoJson)['firstKey'];
        }
        if (createLeadDto.email) {
          const isValidEmail = await this.emailService.validateEmailDomain(
            createLeadDto.email,
          );
          if (!isValidEmail) {
            throw new BadRequestException(
              `The email address "${createLeadDto.email}" is invalid or not allowed.`,
            );
          }
          let leadcopy = JSON.parse(JSON.stringify(createLeadDto));
          const _existingLead = await this.prisma.lead.findFirst({
            where: { email: createLeadDto.email },
          });
          if (_existingLead && _existingLead.convId != createLeadDto.convId) {
            await this.prisma.zautoMessage.updateMany({
              where: { convId: _existingLead.convId },
              data: { convId: createLeadDto.convId },
            });
            createLeadDto = {
              ..._existingLead,
              ...leadcopy,
              email: leadcopy.email,
            };
            await this.prisma.conversation.delete({
              where: { id: _existingLead.convId },
            });
          }
        }

        // const crmContact = await this.contactService.createContact(orgId ,createLeadDto)
        // const crmContactid = crmContact.id || null;
        return await this.prisma.lead.create({
          data: { ...createLeadDto, orgId },
        });
      }
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async findAll(paginationDto: PaginationDto, orgId: string) {
    const { page, limit } = paginationDto;
    const skip = (page - 1) * limit;
    const roleData = await this.prisma.lead.findMany({ skip, take: limit });
    const total = await this.prisma.lead.count();
    return {
      data: roleData,
      page: page,
      total: total,
    };
  }

  async findAllByAgent(agentId: string, paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;
    const skip = (page - 1) * limit;
    const roleData = await this.prisma.lead.findMany({
      skip,
      take: limit,
      where: { agentId },
      include: {
        conversation: {
          select: {
            visit: true,
            visitor: true,
            campaign: true,
          },
        },
      },
    });
    const total = await this.prisma.lead.count({ where: { agentId } });
    return {
      data: roleData,
      page: page,
      total: total,
    };
  }

  async findAllByOrg(orgId: string, paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;
    const skip = (page - 1) * limit;
    const roleData = await this.prisma.lead.findMany({
      skip,
      take: limit,
      where: { orgId },
      orderBy: {
        modifiedAt: 'desc',
      },
      include: {
        conversation: {
          select: {
            visit: true,
            visitor: true,
            campaign: true,
          },
        },
      },
    });
    const total = await this.prisma.lead.count({ where: { orgId } });
    return {
      data: roleData,
      page: page,
      total: total,
    };
  }

  async findOne(id: string, orgId: string) {
    const existingLead = await this.prisma.lead.findUnique({
      where: { id },
      include: {
        conversation: {
          select: {
            visit: true,
            visitor: true,
            summary: true,
            campaign: true,
          },
        },
      },
    });
    if (existingLead) {
      return existingLead;
    } else throw new NotFoundException(`Lead with id ${id} not found.`);
  }

  async update(id: string, orgId: string, updateLeadDto: UpdateLeadDto) {
    const existingLead = await this.prisma.lead.findUnique({ where: { id } });
    if (existingLead) {
      // await this.contactService.updateContact(existingLead.orgId, id,updateLeadDto);
      return await this.prisma.lead.update({
        data: updateLeadDto,
        where: { id },
      });
    } else throw new NotFoundException(`Lead with id ${id} not found.`);
  }

  async remove(id: string, orgId: string) {
    const existingLead = await this.prisma.lead.findUnique({ where: { id } });
    if (existingLead) {
      // await this.contactService.deleteContact(existingLead.orgId, existingLead.crmContactid);
      return await this.prisma.lead.delete({ where: { id } });
    } else throw new NotFoundException(`Lead with id ${id} not found.`);
  }

  async validateEmail(validateEmailDto: ValidateEmailDto) {
    const { email, visitorId } = validateEmailDto;

    // check visitor
    const existingVisitor = await this.prisma.visitor.findUnique({
      where: {
        id: visitorId,
      },
    });
    if (!existingVisitor) {
      throw new NotFoundException(`Visitor not found with id ${visitorId}`);
    }
    // validate email
    const isValid = await this.emailService.validateEmailDomain(email);
    let message = `The email address "${validateEmailDto.email}" is valid.`;
    if (!isValid)
      message = `The email address ${validateEmailDto.email} is invalid or not allowed.`;
    return {
      status: HttpStatus.OK,
      message: message,
      isValid: isValid,
    };
  }
}
