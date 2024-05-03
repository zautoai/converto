import { BadRequestException, Injectable } from '@nestjs/common';
import { data } from 'cheerio/lib/api/attributes';
import { AgentStatus } from 'src/agent/entities/agent.entity';
import { DateFilter } from 'src/common/enums/enums';
import { PrismaService } from 'src/prisma/prisma.service';
import { DashbaordDto } from './dto/dashboard.dto';
import { Sql } from '@prisma/client/runtime/library';
import { Prisma } from '@prisma/client';
import { DEFAULT_SCHEMA_NAME } from 'src/common/constants/system.constants';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getAgentsCount(orgId: string) {
    try {
      return await this.prisma.agent.count({
        where: { orgId, status: { not: AgentStatus.DELETED } },
      });
    } catch (error) {
      console.log(error);
    }
  }

  async getUsersCount(orgId: string) {
    try {
      return await this.prisma.user.count({ where: { orgId } });
    } catch (error) {
      console.log(error);
    }
  }

  async getVisitorsCount(orgId: string, startDate?: Date, endDate?: Date) {
    try {
      if (startDate && endDate) {
        return await this.prisma.visitor.count({
          where: {
            orgId,
            createdAt: {
              gte: new Date(startDate), // Greater than or equal to start date
              lte: new Date(endDate), // Less than or equal to end date
            },
          },
        });
      } else {
        return await this.prisma.visitor.count({ where: { orgId } });
      }
    } catch (error) {
      console.log(error);
    }
  }

  async getLeadsCount(orgId: string, startDate?: Date, endDate?: Date) {
    try {
      if (startDate && endDate) {
        return await this.prisma.lead.count({
          where: {
            orgId,
            createdAt: {
              gte: new Date(startDate), // Greater than or equal to start date
              lte: new Date(endDate), // Less than or equal to end date
            },
          },
        });
      } else {
        return await this.prisma.lead.count({ where: { orgId } });
      }
    } catch (error) {
      console.log(error);
    }
  }

  async getConversationCount(orgId: string, startDate?: Date, endDate?: Date) {
    try {
      if (startDate && endDate) {
        return await this.prisma.conversation.count({
          where: {
            orgId,
            createdAt: {
              gte: new Date(startDate), // Greater than or equal to start date
              lte: new Date(endDate), // Less than or equal to end date
            },
          },
        });
      } else {
        return await this.prisma.conversation.count({ where: { orgId } });
      }
    } catch (error) {
      console.log(error);
    }
  }

  async getCampaignCount(orgId: string, startDate?: Date, endDate?: Date) {
    try {
      if (startDate && endDate) {
        return await this.prisma.campaign.count({
          where: {
            orgId,
            startDate: {
              gte: new Date(startDate), // Greater than or equal to start date
              lte: new Date(endDate), // Less than or equal to end date
            },
          },
        });
      } else {
        return await this.prisma.campaign.count({ where: { orgId } });
      }
    } catch (error) {
      console.log(error);
    }
  }

  async getSitesCount(orgId: string) {
    try {
      return await this.prisma.site.count({ where: { orgId } });
    } catch (error) {
      console.log(error);
    }
  }

  async getLeadsCountAgentWise(orgId: string) {
    try {
      return await this.prisma.lead.groupBy({
        by: ['agentId'],
        where: { orgId },
        _count: { agentId: true },
      });
    } catch (error) {
      console.log(error);
    }
  }

  async getConversationCountAgentWise(orgId: string) {
    try {
      return await this.prisma.conversation.groupBy({
        by: ['agentId'],
        where: { orgId },
        _count: { agentId: true },
      });
    } catch (error) {
      console.log(error);
    }
  }

  async getCampaignCountAgentWise(orgId: string) {
    try {
      return await this.prisma.campaign.groupBy({
        by: ['agentId'],
        where: { orgId },
        _count: { agentId: true },
      });
    } catch (error) {
      console.log(error);
    }
  }

  getMessageCount(conversation: string) {}

  async getMessagesCount(orgId: string) {
    try {
      const conversations = await this.prisma.zautoMessage.count({
        where: { orgId, role: 'assistant', type: 'TEXT' },
      });
      return conversations;
    } catch (error) {
      console.log(error);
    }
  }

  async getMessagesCountByAgent(agentId: string) {
    try {
      const conversations = await this.prisma.zautoMessage.count({
        where: { agentId, role: 'assistant', type: 'TEXT' },
      });
      return conversations;
    } catch (error) {
      console.log(error);
    }
  }
  async getLeadCountByAgent(agentId: string) {
    try {
      const leads = await this.prisma.lead.count({ where: { agentId } });
      return leads;
    } catch (error) {
      console.log(error);
    }
  }
  async getVisitorCountByAgent(agentId: string) {
    try {
      const visitors = await this.prisma.visitor.count({ where: { agentId } });
      return visitors;
    } catch (error) {
      console.log(error);
    }
  }
  async getConversationCountByAgent(agentId: string) {
    try {
      const conversations = await this.prisma.conversation.count({
        where: { agentId },
      });
      return conversations;
    } catch (error) {
      console.log(error);
    }
  }

  async getCampaignWiseVisitCount(agentId: string) {
    try {
      const campaignWiseData = await this.prisma.campaign.findMany({
        where: { agentId },
        // include: {
        //     Visitors: {
        //         select: {
        //             id: true,
        //         }
        //     },
        // }
      });

      const visitors = [],
        labels = [];
      // for(let campaign of campaignWiseData){
      //     labels.push(campaign.title)
      //     visitors.push(campaign.Visitors.length);
      // }
      return { visitors, labels };
    } catch (error) {
      console.log(error);
    }
  }

  async getPlatformWiseVisitCount(agentId: string) {
    try {
      const platformWiseData = await this.prisma.visitor.groupBy({
        where: { agentId },
        by: ['agentId'],
        _count: {
          agentId: true,
        },
      });

      const visitors = [],
        labels = [];
      for (let platform of platformWiseData) {
        labels.push(platform.agentId);
        visitors.push(platform._count.agentId);
      }
      return { visitors, labels };
    } catch (error) {
      console.log(error);
    }
  }

  async getVisitCountByPlatform(orgId: string, dashbaordDto: DashbaordDto) {
    try {
      let { startDate, endDate } = this.calculateDateRange(dashbaordDto);
      const platformVisitData = await this.prisma.visit.groupBy({
        where: {
          orgId,
          createdAt: {
            gte: startDate.toISOString(),
            lte: endDate.toISOString(),
          },
        },
        by: ['source'],
        _count: {
          source: true,
        },
      });
      const formattedData = platformVisitData.map((item) => ({
        source: item.source,
        count: item._count.source,
      }));

      return formattedData;
    } catch (error) {
      console.log(error);
    }
  }

  toDateString = (date) => {
    return date.toISOString().split('T')[0];
  };

  async getVisitCountByDate(orgId: string, dashbaordDto: DashbaordDto) {
    try {
      let { startDate, endDate } = this.calculateDateRange(dashbaordDto);

      const _startDate = startDate;
      const _endDate = endDate;
      const result = await this.prisma.$queryRaw`
            WITH
                DATE_RANGE AS (
                    SELECT
                        GENERATE_SERIES(
                            ${_startDate}::DATE,
                            ${_endDate}::DATE,
                            '1 day'::INTERVAL
                        ) AS VISIT_DATE
                )
            SELECT
                JSONB_BUILD_OBJECT(
                    'labels',
                    ARRAY_AGG(VISIT_DATE),
                    'values',
                    ARRAY_AGG(VISIT_COUNT)
                ) AS RESULT
            FROM
                (
                    SELECT
                        DR.VISIT_DATE,
                        CAST(COALESCE(COUNT(V.ID), 0) AS INT) AS VISIT_COUNT
                    FROM
                        DATE_RANGE DR
                        LEFT JOIN "Visit" V ON DATE (V."createdAt") = DR.VISIT_DATE
                        AND V."orgId" = ${orgId}
                    WHERE
                        DR.VISIT_DATE >= ${_startDate}
                        AND DR.VISIT_DATE <= ${_endDate}
                    GROUP BY
                        DR.VISIT_DATE
                ) AS SUBQUERY;

            `;
      if (result && result[0]) {
        return result[0].result;
      }
      return {
        labels: [],
        values: [],
      };
    } catch (error) {
      console.log(error);
    }
  }

  async getLeadCountByDate(orgId: string, dashbaordDto: DashbaordDto) {
    try {
      let { startDate, endDate } = this.calculateDateRange(dashbaordDto);
      const _startDate = startDate;
      const _endDate = endDate;
      const result = await this.prisma.$queryRaw`
            WITH
                DATE_RANGE AS (
                    SELECT
                        GENERATE_SERIES(
                            ${_startDate}::DATE,
                            ${_endDate}::DATE,
                            '01 day'::INTERVAL
                        ) AS LEAD_DATE
                )
            SELECT
                JSONB_BUILD_OBJECT(
                    'labels',
                    ARRAY_AGG(LEAD_DATE),
                    'values',
                    ARRAY_AGG(LEAD_COUNT)
                ) AS RESULT
            FROM
                (
                    SELECT
                        DR.LEAD_DATE,
                        CAST(COALESCE(COUNT(L.ID), 0) AS INT) AS LEAD_COUNT
                    FROM
                        DATE_RANGE DR
                        LEFT JOIN "Lead" L ON DATE (L."createdAt") = DR.LEAD_DATE
                        AND L."convId" IS NOT NULL
                        AND L."orgId" = ${orgId}
                    WHERE
                        DR.LEAD_DATE >= ${_startDate}
                        AND DR.LEAD_DATE <= ${_endDate}
                    GROUP BY
                        DR.LEAD_DATE
                ) AS SUBQUERY;

            `;
      if (result && result[0]) {
        return result[0].result;
      }
      return {
        labels: [],
        values: [],
      };
    } catch (error) {
      console.log(error);
    }
  }

  async getConversationCountByDate(orgId: string, dashbaordDto: DashbaordDto) {
    try {
      let { startDate, endDate } = this.calculateDateRange(dashbaordDto);
      const _startDate = startDate;
      const _endDate = endDate;
      const result = await this.prisma.$queryRaw`
            WITH
                DATE_RANGE AS (
                    SELECT
                        GENERATE_SERIES(
                            ${_startDate}::DATE,
                            ${_endDate}::DATE,
                            '1 day'::INTERVAL
                        ) AS CONVO_DATE
                )
            SELECT
                JSONB_BUILD_OBJECT(
                    'labels',
                    ARRAY_AGG(CONVO_DATE),
                    'values',
                    ARRAY_AGG(CONVO_COUNT)
                ) AS RESULT
            FROM
                (
                    SELECT
                        DR.CONVO_DATE,
                        CAST(COALESCE(COUNT(C.ID), 0) AS INT) AS CONVO_COUNT
                    FROM
                        DATE_RANGE DR
                        LEFT JOIN "Conversation" C ON DATE (C."createdAt") = DR.CONVO_DATE
                        AND C."orgId" = ${orgId}
                        AND C."isValid" = TRUE
                    WHERE
                        DR.CONVO_DATE >= ${_startDate}
                        AND DR.CONVO_DATE <= ${_endDate}
                    GROUP BY
                        DR.CONVO_DATE
                    ORDER BY
                        DR.CONVO_DATE
                ) AS SUBQUERY;

            `;
      if (result && result[0]) {
        return result[0].result;
      }
      return {
        labels: [],
        values: [],
      };
    } catch (error) {
      console.log(error);
    }
  }

  async getCampaignCountByDate(orgId: string, dashbaordDto: DashbaordDto) {
    try {
      let { startDate, endDate } = this.calculateDateRange(dashbaordDto);
      const dateWiseConvo = await this.prisma.campaign.groupBy({
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
          orgId,
        },
      });

      const _dateWiseLead = {};

      const currentDate = new Date(startDate);
      const end = new Date(endDate);
      while (currentDate <= end) {
        _dateWiseLead[currentDate.toISOString().split('T')[0]] = 0;
        currentDate.setDate(currentDate.getDate() + 1);
      }

      // Update counts for existing dates
      for (let dateData of dateWiseConvo) {
        const date = this.toDateString(dateData.createdAt);
        if (_dateWiseLead.hasOwnProperty(date)) {
          _dateWiseLead[date] += dateData._count.createdAt;
        }
      }

      // Sort and format data for return
      const sortedKeys = Object.keys(_dateWiseLead).sort((a, b) => {
        return new Date(a).getTime() - new Date(b).getTime();
      });
      const labels = [];
      const values = [];
      for (let key of sortedKeys) {
        labels.push(key);
        values.push(_dateWiseLead[key]);
      }

      return {
        labels: labels,
        values: values,
      };
    } catch (error) {
      console.log(error);
    }
  }

  calculateDateRange(dashbaordDto: DashbaordDto): {
    startDate: Date;
    endDate: Date;
  } {
    const { dateFilter, startDate, endDate } = dashbaordDto;
    const now = new Date();
    let calculatedStartDate: Date;
    let calculatedEndDate: Date;

    switch (dateFilter) {
      case DateFilter.THIS_MONTH:
        calculatedStartDate = new Date(now.getFullYear(), now.getMonth(), 1);
        calculatedEndDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      case DateFilter.LAST_MONTH:
        const lastMonthYear =
          now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
        const lastMonthMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
        calculatedStartDate = new Date(lastMonthYear, lastMonthMonth, 1);
        calculatedEndDate = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      case DateFilter.THIS_WEEK:
        const today = now.getDay();
        const diff = now.getDate() - today + (today === 0 ? -6 : 1);
        calculatedStartDate = new Date(now.setDate(diff));
        calculatedEndDate = new Date(calculatedStartDate); // Copy start date
        calculatedEndDate.setDate(calculatedStartDate.getDate() + 6); // Add 6 days
        calculatedEndDate.setHours(23, 59, 59, 999); // Set end time
        break;
      case DateFilter.BETWEEN:
        if (!startDate || !endDate) {
          throw new BadRequestException(
            'Start date and end date are required for BETWEEN filter',
          );
        }
        calculatedStartDate = new Date(startDate);
        calculatedEndDate = new Date(endDate);
        calculatedEndDate.setHours(23, 59, 59, 999);
        break;
      default:
        throw new BadRequestException('Invalid filter');
    }

    // Formatting dates to string as per the specified format
    const startDateString =
      calculatedStartDate.toISOString().slice(0, 10) + 'T00:00:00.000Z';
    const endDateString =
      calculatedEndDate.toISOString().slice(0, 10) + 'T23:59:59.999Z';

    // Converting formatted strings back to Date objects
    const formattedStartDate = new Date(startDateString);
    const formattedEndDate = new Date(endDateString);

    return { startDate: formattedStartDate, endDate: formattedEndDate };
  }

  generateDateWiseData(startDate: Date, endDate: Date, data: any) {
    const _dateWiseData = {};

    const currentDate = new Date(startDate);
    const end = new Date(endDate);
    while (currentDate <= end) {
      _dateWiseData[currentDate.toISOString().split('T')[0]] = [];
      currentDate.setDate(currentDate.getDate() + 1);
    }

    for (let item of data) {
      const date = this.toDateString(item.createdAt);
      if (_dateWiseData.hasOwnProperty(date)) {
        _dateWiseData[date].push(item);
      }
    }

    const sortedKeys = Object.keys(_dateWiseData).sort((a, b) => {
      return new Date(a).getTime() - new Date(b).getTime();
    });

    return {
      dateWiseData: _dateWiseData,
      sortedKeys: sortedKeys,
    };
  }

  async getLeadCount(orgId: string, dashbaordDto: DashbaordDto) {
    let { startDate, endDate } = this.calculateDateRange(dashbaordDto);
    const leads = await this.prisma.lead.findMany({
      where: {
        orgId,
        createdAt: {
          gte: startDate.toISOString(),
          lte: endDate.toISOString(),
        },
      },
      include: {
        conversation: {
          include: {
            visit: {
              select: {
                source: true,
                campaignId: true,
              },
            },
          },
        },
      },
    });

    const sourceCountMap = {};

    for (let lead of leads) {
      if (lead && lead.conversation) {
        const { source } = lead.conversation.visit;

        if (!sourceCountMap[source]) {
          sourceCountMap[source] = 0;
        }
        sourceCountMap[source] += 1;
      }
    }

    const formattedData = Object.keys(sourceCountMap).map((source) => ({
      source,
      count: sourceCountMap[source],
    }));

    return formattedData;
  }

  async getCounts(orgId: string, dashbaordDto: DashbaordDto) {
    const visitorData = await this.getVisitCountByDate(orgId, dashbaordDto);
    const leadData = await this.getLeadCountByDate(orgId, dashbaordDto);
    const convoData = await this.getConversationCountByDate(
      orgId,
      dashbaordDto,
    );
    const campaignData = await this.getCampaignCountByDate(orgId, dashbaordDto);

    const visitorCount = visitorData.values.reduce(
      (acc, curr) => acc + curr,
      0,
    );
    const leadCount = leadData.values.reduce((acc, curr) => acc + curr, 0);
    const convoCount = convoData.values.reduce((acc, curr) => acc + curr, 0);
    const campaignCount = campaignData.values.reduce(
      (acc, curr) => acc + curr,
      0,
    );
    return {
      visitorCount,
      leadCount,
      convoCount,
      campaignCount,
    };
  }

  async getChart(orgId: string, dashbaordDto: DashbaordDto) {
    const leadData = await this.getLeadCountByDate(orgId, dashbaordDto);
    const visitorData = await this.getVisitCountByDate(orgId, dashbaordDto);
    const convoData = await this.getConversationCountByDate(
      orgId,
      dashbaordDto,
    );
    return {
      visitorData,
      convoData,
      leadData,
      labels: leadData.labels,
    };
  }

  async getTopCampaigns(orgId: string, dashbaordDto: DashbaordDto) {
    try {
      let { startDate, endDate } = this.calculateDateRange(dashbaordDto);
      const _startDate = startDate;
      const _endDate = endDate;

      const top5Campaigns = await this.prisma.$queryRaw`
                WITH CampaignCounts AS (
                    SELECT
                        C.ID,
                        C.TITLE AS NAME,
                        COALESCE(COUNT(DISTINCT V."id"), 0) AS VISITCOUNT,
                        COALESCE(COUNT(DISTINCT CONV."id"), 0) AS CONVOCOUNT,
                        COALESCE(COUNT(DISTINCT L."id"), 0) AS LEADCOUNT
                    FROM
                        "Campaign" C
                        LEFT JOIN "Visit" V ON C.ID = V."campaignId" AND V."createdAt" >= ${_startDate} AND V."createdAt" <= ${_endDate}
                        LEFT JOIN "Conversation" CONV ON C.ID = CONV."campaignId" AND CONV."isValid" = TRUE AND CONV."createdAt" >= ${_startDate} AND CONV."createdAt" <= ${_endDate}
                        LEFT JOIN "Lead" L ON CONV.ID = L."convId" AND L."createdAt" >= ${_startDate} AND L."createdAt" <= ${_endDate}
                    WHERE
                        C."orgId" = ${orgId}
                    GROUP BY
                        C.ID,
                        C.TITLE
                )
                SELECT
                    NAME,
                    CAST(VISITCOUNT AS INT),
                    CAST(CONVOCOUNT AS INT),
                    CAST(LEADCOUNT AS INT)
                FROM
                    CampaignCounts

                UNION ALL

                SELECT
                    C.TITLE AS NAME,
                    0 AS VISITCOUNT,
                    0 AS CONVOCOUNT,
                    0 AS LEADCOUNT
                FROM
                    "Campaign" C
                WHERE
                    NOT EXISTS (
                        SELECT 1 FROM CampaignCounts
                    )
                    AND C."orgId" = ${orgId}
                ORDER BY leadCount DESC, convoCount DESC, visitCount DESC
                LIMIT 5

            `;

      return top5Campaigns;
    } catch (error) {
      console.log(error);
      throw new BadRequestException(error);
    }
  }

  calculateCampaignScore(campaign) {
    const { leadCount, convoCount, visitCount } = campaign;
    const leadWeight = 0.5;
    const convoWeight = 0.3;
    const visitWeight = 0.2;

    // Calculate the score using the provided weights
    const score =
      leadCount * leadWeight +
      convoCount * convoWeight +
      visitCount * visitWeight;

    return score;
  }
}
