import { Injectable } from '@nestjs/common';
import { FilterDto } from 'src/common/dto/filter.dto';
import { BaseService } from 'src/common/services/base.service';
import { ContactService } from 'src/microservices/crm_service/contact.service';
import { CreateFieldDto } from './dto/create-field.dto';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bull';

@Injectable()
export class ContactsService extends BaseService {
  constructor(
    private readonly contactService: ContactService,
    @InjectQueue('icp_score_queue') private readonly icpScoreQueue: Queue,
  ) {
    super();
  }

  async create(orgId: string, createContactDto: any) {
    const response=await this.handleException(
      await this.contactService.createContact(orgId, createContactDto),
    );
    const contact = response.data;
    await this.icpScoreQueue.add('icp_score', { orgId, contact });
    return response;
  }

  async findAll(orgId: string, filterDto?: FilterDto) {
    try {
      const response = (await this.handleException(
        await this.contactService.getContacts(orgId, filterDto),
      ))
      const contacts=response.data;      
      const contactIds = contacts.map(contact => contact.id);
      const prisma = await this.getPrismaClient(orgId);
      const icpScores = await prisma.icpScore.findMany({ where: { contactId: { in: contactIds } } })
      const icpScoreMap = new Map();
      icpScores.forEach(icpScore => {
        icpScoreMap.set(icpScore.contactId, icpScore);
      });
      const results = contacts.map(contact => ({
        ...contact,
        icpScore: icpScoreMap.get(contact.id)?.score ?? null,
        icpCategory: icpScoreMap.get(contact.id)?.category ?? null,
      }));

      return {
        ...response,
        data: results,
      };
    }
    catch (err) {
      throw err;
    }
  }

  async findOne(orgId: string, id: string) {
    try {
      const response = await this.handleException(
        await this.contactService.getContact(orgId, id),
      );
      const contact = response.data;
      const prisma = await this.getPrismaClient(orgId);
      const icpScore = await prisma.icpScore.findFirst({
        where: { contactId: contact.id },
      });
      const result={
        ...contact,
        icpScore: icpScore?.score ?? null,
        icpCategory: icpScore?.category ?? null
      }
      return {
        ...response,
        data:result
      };
    } catch (err) {
      throw err;
    }
  }
  

  async update(orgId: string, id: string, updateContactDto: any) {
    const response=await this.handleException(
      await this.contactService.updateContact(orgId, id, updateContactDto),
    );
    const contact = response.data;
    await this.icpScoreQueue.add('icp_score', { orgId, contact });
    return response;
  }

  async remove(orgId: string, id: string) {
    return this.handleException(
      await this.contactService.deleteContact(orgId, id),
    );
  }

  async getContactFields(orgId: string) {
    return this.handleException(
      await this.contactService.getContactFields(orgId),
    );
  }

  async createCustomFields(orgId: string, createFieldDto: CreateFieldDto) {
    return this.handleException(
      await this.contactService.createCustomField(orgId, createFieldDto),
    );
  }

  async getContactsByConversation(orgId: string, id: string) {
    return this.handleException(
      await this.contactService.getContactsByConversation(orgId, id)
    )
  }

  async getContactsByDate(orgId: string, startDate: Date, endDate: Date) {
    return this.handleException(
      await this.contactService.getContactsByDate(orgId, startDate, endDate)
    )
  }
}
