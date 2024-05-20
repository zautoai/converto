import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { OrgAccountService } from './account.service';
import { PrismaClientManager } from 'src/prisma/prisma-client-manager.service';

@Injectable()
export class UsageService {

    constructor(
        private prisma: PrismaService,
        private prismaClientManager: PrismaClientManager,
        private accountService: OrgAccountService,
    ) { }

    async getUsage(orgId: string, date: string) {
        const sites = await this.getSiteCount(orgId);
        const users = await this.getUserCount(orgId);
        const messages = await this.getMessageCount(orgId, date);
        const conversations = await this.getConversationCount(orgId, date);
        const campaigns = await this.getCampaginCount(orgId, date);

        return {
            sites,
            users,
            messages,
            conversations,
            campaigns,
        };
    }

    async getSiteCount(orgId: string) {
        const prisma = await this.prismaClientManager.getClient(orgId);
        const account = await this.accountService.findOne(orgId)
        if (!account) {
            throw new NotFoundException("No subscription found.");
        }
        const maxCount = account.subscription.sitesCount;
        const count = await prisma.site.count();
        return { count, maxCount };
    }

    async getUserCount(orgId: string) {
        const prisma = await this.prismaClientManager.getClient(orgId);
        const account = await this.accountService.findOne(orgId)
        if (!account) {
            throw new NotFoundException("No subscription found.");
        }
        const maxCount = account.subscription.userCount;
        const count = await prisma.user.count({ where: { orgId } });
        return { count, maxCount };
    }

    // Messages count
    async getMessageCountBetween(orgId: string, startDate: string, endDate: string) {
        const prisma = await this.prismaClientManager.getClient(orgId);
        const account = await this.accountService.findOne(orgId)
        if (!account) {
            throw new NotFoundException("No subscription found.");
        }
        const maxCount = account.subscription.messageCount;
        let count = await prisma.zautoMessage.count({
            where: {
                orgId,
                type: 'TEXT',
                role: 'assistant',
                createdAt: {
                    gte: new Date(startDate),
                    lte: new Date(endDate),
                }
            }
        });
        const conversationUsage = await this.getConverstionCountBetween(orgId, startDate, endDate);
        count = count - conversationUsage.count;
        return { count, maxCount };
    }

    async getMessageCount(orgId: string, date: string) {
        const { start, end } = this.getStartAndEndOfMonth(date);
        const count = this.getMessageCountBetween(orgId, start, end);
        return count;
    }
    async getMessageCountByYear(orgId: string, date: string) {
        const { start, end } = this.getStartAndEndOfYear(date);
        return this.getMessageCountBetween(orgId, start, end);
    }

    // Conversation Count
    async getConverstionCountBetween(orgId: string, startDate: string, endDate: string) {
        const prisma = await this.prismaClientManager.getClient(orgId);

        const account = await this.accountService.findOne(orgId)
        if (!account) {
            throw new NotFoundException("No subscription found.");
        }
        const maxCount = account.subscription.conversationCount;
        const count = await prisma.conversation.count({
            where: {
                createdAt: {
                    gte: new Date(startDate),
                    lte: new Date(endDate),
                }
            }
        });
        return { count, maxCount };
    }

    async getConversationCount(orgId: string, date: string) {
        const { start, end } = this.getStartAndEndOfMonth(date);
        return this.getConverstionCountBetween(orgId, start, end);
    }
    async getConversationCountByYear(orgId: string, date: string) {
        const { start, end } = this.getStartAndEndOfYear(date);
        return this.getConverstionCountBetween(orgId, start, end);
    }

    // Campaign count
    async getCampaginCountBetween(orgId: string, startDate: string, endDate: string) {
        const prisma = await this.prismaClientManager.getClient(orgId);

        const account = await this.accountService.findOne(orgId)
        if (!account) {
            throw new NotFoundException("No subscription found.");
        }
        const maxCount = account.subscription.campaignCount;
        const count = await prisma.campaign.count({
            where: {
                status: 'ACTIVE',
                createdAt: {
                    gte: new Date(startDate),
                    lte: new Date(endDate),
                }
            }
        });
        return { count, maxCount };
    }

    async getCampaginCount(orgId: string, date: string) {
        const { start, end } = this.getStartAndEndOfMonth(date);
        return this.getCampaginCountBetween(orgId, start, end);
    }
    async getCampaginCountByYear(orgId: string, date: string) {
        const { start, end } = this.getStartAndEndOfYear(date);
        return this.getCampaginCountBetween(orgId, start, end);
    }

    getStartAndEndOfMonth(date: string) {
        let startDate = new Date(date);
        startDate.setDate(1);
        startDate.setUTCHours(0, 0, 0, 0);

        let endDate = new Date(startDate);
        endDate.setUTCMonth(endDate.getUTCMonth() + 1);
        endDate.setUTCDate(0);
        endDate.setUTCHours(23, 59, 59, 999);

        return {
            start: startDate.toISOString(),
            end: endDate.toISOString()
        };
    }

    getStartAndEndOfYear(date: string) {
        let startDate = new Date(date);
        startDate.setUTCMonth(0);
        startDate.setUTCDate(1);
        startDate.setUTCHours(0, 0, 0, 0);

        let endDate = new Date(date);
        endDate.setUTCMonth(11);
        endDate.setUTCDate(31);
        endDate.setUTCHours(23, 59, 59, 999);

        return {
            start: startDate.toISOString(),
            end: endDate.toISOString()
        };
    }
}
