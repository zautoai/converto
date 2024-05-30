import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCampaignDto } from './dto/create-campaign.dot';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { UpdateCampaignDto } from './dto/update.campaign.dto';
import { CampaignFilterDto } from './dto/campaign-filter.dto';
import { CampaignStatus } from 'src/common/enums/enums';
import { BaseService } from 'src/common/services/base.service';
import { ServiceParams } from 'src/common/models/service-param.model';
import { ContactsService } from 'src/contacts/contacts.service';

@Injectable()
export class CampaignService extends BaseService {
    constructor(
        private contactsService: ContactsService
    ) {
        super();
    }

    async create(serviceParams: ServiceParams<CreateCampaignDto>) {
        const { orgId, data } = serviceParams;
        const prisma = await this.getPrismaClient(orgId);
        try {
            const endDate = new Date();
            endDate.setDate(endDate.getDate() + 30);
            data.endDate = endDate;
            const campaign = await prisma.campaign.create({
                data: {
                    title: data.title,
                    description: data.description,
                    url: data.url,
                    status: data.status,
                    isZauto: data.isZauto,
                    idParam: data.idParam,
                    idValue: data.idValue,
                    endDate: endDate
                }
            });
            return campaign;
        }
        catch (error) {
            console.log(error);
            throw error;
        }
        finally {
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
            const campaignData = await prisma.campaign.findMany({ skip, take: limit });
            const total = await prisma.campaign.count();
            return {
                data: campaignData,
                page: page,
                total: total
            };
        }
        catch (error) {
            console.log(error);
            throw error;
        }
        finally {
            prisma.$disconnect()
            await this.closeConnection(orgId);
        }
    }

    async findAllByOrg(serviceParams: ServiceParams<CampaignFilterDto>) {
        const { orgId, data: campaignFilterDto } = serviceParams;
        const { page, limit } = campaignFilterDto;
        const skip = (page - 1) * limit;
        let campaignData = [], total = 0;
        const prisma = await this.getPrismaClient(orgId);
        try {
            if (campaignFilterDto.searchQ) {
                campaignData = await prisma.campaign.findMany({
                    skip,
                    take:
                        limit,
                    where: {
                        OR: [
                            { title: { contains: campaignFilterDto.searchQ } },
                            { description: { contains: campaignFilterDto.searchQ } },
                            { url: { contains: campaignFilterDto.searchQ } },
                            { status: { equals: CampaignStatus[campaignFilterDto.searchQ.toUpperCase()] || undefined } }
                        ]
                    },
                    orderBy: { modifiedAt: 'desc' }
                });
                total = await prisma.campaign.count({
                    where: {
                        OR: [
                            { title: { contains: campaignFilterDto.searchQ } },
                            { description: { contains: campaignFilterDto.searchQ } },
                            { url: { contains: campaignFilterDto.searchQ } },
                            { status: { equals: CampaignStatus[campaignFilterDto.searchQ.toUpperCase()] || undefined } }
                        ]
                    }
                });
            } else {
                campaignData = await prisma.campaign.findMany({ skip, take: limit, orderBy: { modifiedAt: 'desc' } });
                total = await prisma.campaign.count();
            }

            return {
                data: campaignData,
                page: page,
                total: total
            };
        }
        catch (error) {
            console.log(error);
            throw error;
        }
        finally {
            prisma.$disconnect()
            await this.closeConnection(orgId);
        }
    }

    async findOne(orgId: string, id: string) {
        const prisma = await this.getPrismaClient(orgId);
        try {
            const existingCampaign = await prisma.campaign.findUnique({ where: { id } });
            if (existingCampaign) {
                return existingCampaign;
            }
            else {
                throw new NotFoundException(`Campaign with ${id} not found.`);
            }
        }
        catch (error) {
            console.log(error);
            throw error;
        }
        finally {
            prisma.$disconnect()
            await this.closeConnection(orgId);
        }
    }

    async update(serviceParams: ServiceParams<UpdateCampaignDto>) {
        const { orgId, data, id } = serviceParams;
        const prisma = await this.getPrismaClient(orgId);
        try {
            const existingCampaign = await prisma.campaign.findUnique({ where: { id } });
            if (existingCampaign) {
                let campaignData: any = {
                    title: data.title,
                    description: data.description,
                    status: data.status,
                    url: data.url,
                    isZauto: data.isZauto,
                    idParam: data.idParam,
                    idValue: data.idValue,
                };

                const startDateTimestamp = data.startDateTimestamp;
                const endDateTimestamp = data.endDateTimestamp;

                const startDate = this.formatDate(startDateTimestamp);
                const endDate = this.formatDate(endDateTimestamp);

                if (startDate !== null) {
                    campaignData = { ...campaignData, startDate };
                }

                if (endDate !== null) {
                    campaignData = { ...campaignData, endDate };
                }

                return await prisma.campaign.update({ data: campaignData, where: { id } });
            } else {
                throw new NotFoundException(`Campaign with ${id} not found.`);
            }
        }
        catch (error) {
            console.log(error);
            throw error;
        }
        finally {
            prisma.$disconnect()
            await this.closeConnection(orgId);
        }
    }


    async delete(orgId: string, id: string) {
        const prisma = await this.getPrismaClient(orgId);
        try {
            const existingCampaign = await prisma.campaign.findUnique({ where: { id } });
            if (existingCampaign) {
                return await prisma.campaign.delete({ where: { id } });
            }
            else {
                throw new NotFoundException(`Campaign with ${id} not found.`);
            }
        }
        catch (error) {
            console.log(error);
            throw error;
        }
        finally {
            prisma.$disconnect()
            await this.closeConnection(orgId);
        }
    }

    formatDate(timestamp: number) {
        const date = new Date(timestamp);

        if (isNaN(date.getTime())) {
            return null;
        }
        return date;
    }

    toDateString = (date) => {
        return date.toISOString().split('T')[0];
    };

    async getVisitsCountByDate(orgId: string, id: string) {
        const prisma = await this.getPrismaClient(orgId);
        try {
            const dateWiseVisit = await prisma.visit.groupBy({
                by: ['createdAt'],
                _count: {
                    createdAt: true,
                },
                orderBy: {
                    _count: {
                        createdAt: 'desc',
                    },
                },
                where: {
                    campaignId: id,
                },
            });
            const _dateWiseVisits = {};
            for (let dateData of dateWiseVisit) {
                const date = this.toDateString(dateData.createdAt);

                // If this date isn't in the grouped object yet, add it
                if (!_dateWiseVisits[date]) {
                    _dateWiseVisits[date] = 0;
                }

                // Add the current record to the array for this date
                _dateWiseVisits[date] += dateData._count.createdAt;
            }
            return {
                lables: Object.keys(_dateWiseVisits),
                values: Object.values(_dateWiseVisits)
            }
        }
        catch (error) {
            console.log(error);
            throw error;
        }
        finally {
            prisma.$disconnect()
            await this.closeConnection(orgId);
        }
    }

    async getLeadCountByDate(orgId: string, id: string) {
        const prisma = await this.getPrismaClient(orgId);
        try {
            const campaign = await prisma.campaign.findFirst({
                where: { id },
                include: {
                    Conversations: true
                }
            });
            const leadByDate = {};

            for (let conversation of campaign.Conversations) {
                const lead = await this.contactsService.getContactsByConversation(orgId, conversation.id);
                const createdAt = lead.createdAt;
                if (createdAt) {
                    const date = this.toDateString(createdAt);

                    if (!leadByDate[date]) {
                        leadByDate[date] = 0;
                    }
                    leadByDate[date] += 1;
                }
            }

            const lables = Object.keys(leadByDate);
            const values = Object.values(leadByDate);

            const formattedData = {
                lables,
                values,
            };

            return formattedData;
        }
        catch (error) {
            console.log(error);
            throw error;
        }
        finally {
            prisma.$disconnect()
            await this.closeConnection(orgId);
        }

    }

    async getCounts(orgId: string, campaignId: string) {
        const prisma = await this.getPrismaClient(orgId);
        try {
            const uniqueVisitorCount = await prisma.visit.groupBy({
                by: ['visitorId'],
                where: {
                    campaignId,
                },
                _count: {
                    visitorId: true
                }
            });
            const visitCount = uniqueVisitorCount.length;
            const convoCount = await prisma.conversation.count({ where: { campaignId, isValid: true } });
            const conversations = await prisma.conversation.findMany({ where: { campaignId, isValid: true } });
            let totalLeadCount = 0;
            for (const conversation of conversations) {
                const lead = await this.contactsService.getContactsByConversation(orgId, conversation.id);
                if (lead) {
                    totalLeadCount += 1;
                }
            }

            return {
                visits: visitCount,
                conversations: convoCount,
                leads: totalLeadCount,
            };
        }
        catch (error) {
            console.log(error);
            throw error;
        }
        finally {
            prisma.$disconnect()
            await this.closeConnection(orgId);
        }
    }
}
