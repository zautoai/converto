import { Injectable, OnModuleInit } from '@nestjs/common';
import { BaseService } from 'src/common/services/base.service';
import { ContactsService } from 'src/contacts/contacts.service';
import { DashbaordDto } from './dto/dashboard.dto';
import { AccountsService } from 'src/accounts/accounts.service';
import { ProspecActivityType } from 'src/prospect-journey/dto/create-prospect-journey.dto'
import { ContactService } from 'src/microservices/crm_service/contact.service';
import { DashboardDataDto } from './dto/dashboardData.dto';
import { getDate } from 'src/common/helpers/date.helper';
import { DateFilter } from 'src/common/enums/enums';
@Injectable()
export class DashboardService extends BaseService implements OnModuleInit {

  constructor(
    private readonly contactsService: ContactsService,
    private readonly accountsService: AccountsService,
    private readonly contactService: ContactService,
  ) {
    super()
  }

  onModuleInit() {
    this.getPipelineValueGenerator('f3b3d555-1cfa-441d-aef9-be62696d3422', 'this_year')
  }

  async changeDashboardData(orgId: string, dashboardDataDto: DashboardDataDto) {
    const prisma = await this.getPrismaClient(orgId)
    try {
      const dashboard = await prisma.dashboard.findFirst();
      if (dashboard) {
        await prisma.dashboard.update({
          where: { id: dashboard.id },
          data: dashboardDataDto
        })
      }
      return;
    } catch (error) {
      console.log(error);
    } finally {
      await prisma.$disconnect()
    }
  }

  async getDashboardData(orgId: string) {
    const prisma = await this.getPrismaClient(orgId)
    try {
      const dashboard = await prisma.dashboard.findFirst();
      return {
        code: 200,
        success: true,
        message: 'Dashboard data fetched successfully',
        data: dashboard
      };
    } catch (error) {
      console.log(error);
    } finally {
      await prisma.$disconnect()
    }
  }

  async getBottomWidget(orgId: string, dateFilter: DateFilter, start?: string, end?: string) {
    try {

      const date = getDate(dateFilter, { start, end });
      const currentVisitCount = await this.getVisitCount(orgId, date.current.start, date.current.end);
      const currentContactCount = await this.getContactCount(orgId, date.current.start, date.current.end);
      const currentAccountCount = await this.getAccountCount(orgId, date.current.start, date.current.end);

      let result = [
        { title: 'Total visits', subtitle: this.getSubtitle(dateFilter), currentValue: currentVisitCount, icon: 'eye' },
        { title: 'Total new Leads', subtitle: this.getSubtitle(dateFilter), currentValue: currentContactCount, icon: 'user' },
        { title: 'Total new Accounts', subtitle: this.getSubtitle(dateFilter), currentValue: currentAccountCount, icon: 'briefcase' }
      ]
      if (dateFilter !== DateFilter.BETWEEN) {
        const previousVisitCount = await this.getVisitCount(orgId, date.previous.start, date.previous.end);
        const previousContactCount = await this.getContactCount(orgId, date.previous.start, date.previous.end);
        const previousAccountCount = await this.getAccountCount(orgId, date.previous.start, date.previous.end);

        result = result.map((item) => {
          return {
            ...item,
            pastPeriod: `Past ${this.getPastPeriodName(dateFilter)} ${(this.getPreviousBottomValue(item.title, previousVisitCount, previousContactCount, previousAccountCount)?.toFixed(2) || '0')}`,
            ...this.calculateChange(item.currentValue, (this.getPreviousBottomValue(item.title, previousVisitCount, previousContactCount, previousAccountCount) || 0))
          }
        })
      }
      return {
        code: 200,
        success: true,
        message: 'Contacts fetched successfully',
        data: result
      };

    } catch (error) {
      console.error('Error counting visits:', error);
      throw error;
    }
  }

  async getVisitCount(orgId: string, startOfMonthISO: string, endOfMonthISO: string) {
    const prisma = await this.getPrismaClient(orgId);
    try {
      // Query to count visits for the current month
      const visitCount = await prisma.visit.count({
        where: {
          createdAt: {
            gte: startOfMonthISO,
            lte: endOfMonthISO,
          },
        },
      });

      return visitCount
    } catch (error) {
      console.error('Error counting visits:', error);
      throw error;
    } finally {
      await prisma.$disconnect();
    }
  }

  async getContactCount(orgId: string, startOfMonthISO: string, endOfMonthISO: string) {
    return await this.contactsService.getContactCount(orgId, startOfMonthISO, endOfMonthISO)
  }

  async getAccountCount(orgId: string, startOfMonthISO: string, endOfMonthISO: string) {
    return await this.accountsService.getAccountCount(orgId, startOfMonthISO, endOfMonthISO)
  }

  private calculateChange(current: number, previous: number): { change: string, color: string } {
    if (previous === 0) {
      return { change: current === 0 ? '0%' : '+100%', color: 'success' };
    }

    if (current === 0) {
      return { change: '-100%', color: 'danger' };
    }

    const isPositive = current >= previous;
    const change = isPositive ? current - previous : previous - current;
    const changePercentage = (change / previous) * 100;

    return {
      change: `${isPositive ? '+' : '-'}${changePercentage.toFixed(2)}%`,
      color: isPositive ? 'success' : 'danger'
    };
  }

  async getTopWidget(orgId: string, dateFilter: DateFilter, start?: string, end?: string) {
    try {
      const date = getDate(dateFilter, { start, end });

      const currentPVG = await this.calculatePVG(orgId, date.current.start, date.current.end);
      const currentCAC = await this.calculateCAC(orgId, date.current.start, date.current.end);
      const currentCPL = await this.calculateCPL(orgId, date.current.start, date.current.end);

      let result = [
        { title: 'Total PVG', subtitle: this.getSubtitle(dateFilter), currentValue: '$' + (currentPVG?.toFixed(2) || '0') },
        { title: 'Total CAC', subtitle: this.getSubtitle(dateFilter), currentValue: '$' + (currentCAC?.toFixed(2) || '0') },
        { title: 'Total CPL', subtitle: this.getSubtitle(dateFilter), currentValue: '$' + (currentCPL?.toFixed(2) || '0') }
      ];

      // Only include past period if dateFilter is not BETWEEN
      if (dateFilter !== DateFilter.BETWEEN) {
        const previousPVG = await this.calculatePVG(orgId, date.previous.start, date.previous.end);
        const previousCAC = await this.calculateCAC(orgId, date.previous.start, date.previous.end);
        const previousCPL = await this.calculateCPL(orgId, date.previous.start, date.previous.end);

        result = result.map(item => ({
          ...item,
          pastPeriod: `Past ${this.getPastPeriodName(dateFilter)} $${(this.getPreviousValue(item.title, previousPVG, previousCAC, previousCPL)?.toFixed(2) || '0')}`
        }));
      }
      else {
        result = result.map(item => ({
          ...item,
          pastPeriod: ''
        }));
      }

      return {
        code: 200,
        success: true,
        message: 'Top widget data fetched successfully',
        data: result
      };
    } catch (error) {
      console.error('Error fetching top widget data:', error);
      throw error;
    }
  }

  private getSubtitle(dateFilter: DateFilter): string {
    switch (dateFilter) {
      case DateFilter.THIS_MONTH:
        return 'This Month';
      case DateFilter.THIS_QUARTER:
        return 'This Quarter';
      case DateFilter.THIS_YEAR:
        return 'This Year';
      case DateFilter.BETWEEN:
        return 'Custom Range';
      default:
        return '';
    }
  }

  private getPastPeriodName(dateFilter: DateFilter): string {
    switch (dateFilter) {
      case DateFilter.THIS_MONTH:
      case DateFilter.BETWEEN:
        return 'Month';
      case DateFilter.THIS_QUARTER:
        return 'Quarter';
      case DateFilter.THIS_YEAR:
        return 'Year';
      default:
        return 'Period';
    }
  }

  private getPreviousValue(title: string, previousPVG?: number, previousCAC?: number, previousCPL?: number): number | undefined {
    switch (title) {
      case 'Total PVG':
        return previousPVG;
      case 'Total CAC':
        return previousCAC;
      case 'Total CPL':
        return previousCPL;
      default:
        return undefined;
    }
  }

  private getPreviousBottomValue(title: string, previousVisitCount?: number, previousContactCount?: number, previousAccountCount?: number): number | undefined {
    switch (title) {
      case 'Total visits':
        return previousVisitCount;
      case 'Total new Leads':
        return previousContactCount;
      case 'Total new Accounts':
        return previousAccountCount;
      default:
        return undefined;
    }
  }

  async calculatePVG(orgId: string, startOfMonthISO: string, endOfMonthISO: string) {
    const prisma = await this.getPrismaClient(orgId)
    try {
      const dashboardData = await prisma.dashboard.findFirst();
      if (!dashboardData) {
        return 0;
      }
      const { averageDealSize, leadConversionRate } = dashboardData
      const totalLeads = await this.getContactCount(orgId, startOfMonthISO, endOfMonthISO);
      const pipelineValue = totalLeads * averageDealSize * leadConversionRate;
      return pipelineValue
    } catch (error) {

    } finally {
      await prisma.$disconnect()
    }
  }

  async calculateCAC(orgId: string, startOfMonthISO: string, endOfMonthISO: string) {
    const prisma = await this.getPrismaClient(orgId)
    try {
      const dashboardData = await prisma.dashboard.findFirst();
      if (!dashboardData) {
        return 0;
      }
      const { salesCost, marketingCost } = dashboardData
      const totalLeads = await this.getContactCount(orgId, startOfMonthISO, endOfMonthISO);
      if (totalLeads === 0 || (salesCost === 0 && marketingCost === 0)) {
        return 0;
      }
      const cac = (marketingCost + salesCost) / totalLeads;
      return cac
    } catch (error) {

    } finally {
      await prisma.$disconnect()
    }
  }

  async calculateCPL(orgId: string, startOfMonthISO: string, endOfMonthISO: string) {
    const prisma = await this.getPrismaClient(orgId)
    try {
      const dashboardData = await prisma.dashboard.findFirst();
      if (!dashboardData) {
        return 0;
      }
      const { marketingCost } = dashboardData
      const totalLeads = await this.getContactCount(orgId, startOfMonthISO, endOfMonthISO);
      if (totalLeads === 0 || marketingCost === 0) {
        return 0;
      }
      const cplValue = marketingCost / totalLeads;
      return cplValue
    } catch (error) {

    } finally {
      await prisma.$disconnect()
    }
  }

  async getPageEnhancementMetrics(orgId: string, dateFilter: string, start?: string, end?: string) {
    const prisma = await this.getPrismaClient(orgId);
    const date = getDate(dateFilter, { start, end })

    try {
      const prospectJourney = await prisma.prospectJourney.findMany({
        where: {
          type: {
            in: [
              ProspecActivityType.PAGE_VIEWED,
              ProspecActivityType.PAGE_CLOSED,
              ProspecActivityType.CTA_PERFORMED
            ]
          },
          createdAt: {
            gte: date.current.start,
            lte: date.current.end
          },
        },
        select: { url: true, scrollDepth: true, timeSpend: true, type: true }
      });

      const pages = prospectJourney.map(journey => new URL(journey.url));
      const pagesNamesMap = await this.getPageNames(pages);

      const result = pagesNamesMap.map(page => {
        const journeys = prospectJourney.filter(journey => journey.url === page.url.href);
        const totalJourneys = journeys.length;
        const totalTimeSpent = journeys.reduce((total, journey) => total + journey.timeSpend, 0);
        const totalScrollDepth = journeys.reduce((total, journey) => total + journey.scrollDepth, 0);
        const ctaCount = journeys.filter(journey => journey.type === ProspecActivityType.CTA_PERFORMED).length;

        return {
          pages: page.pageName,
          visits: totalJourneys,
          avgTimeSpent: this.formatTime(totalTimeSpent / totalJourneys),
          scrollDepth: (totalScrollDepth / totalJourneys).toFixed(2) + "%",
          ctr: (ctaCount / totalJourneys) * 100
        };
      });

      return {
        code: 200,
        success: true,
        message: 'Page enhancement metrics fetched successfully',
        data: result
      };

    } catch (error) {
      console.error('Error counting visits:', error);
      throw error;
    } finally {
      await prisma.$disconnect();
    }
  }

  formatTime(milliseconds) {
    const totalSeconds = milliseconds / 1000;
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = (totalSeconds % 60).toFixed(2);

    return `${h > 0 ? `${h}h ` : ''}${m > 0 ? `${m}m ` : ''}${s}s`.trim();
  }

  formatPageName(pageName) {
    return pageName.replace(/[-_]/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
  }

  async getPageNames(sites) {
    const seenPageNames = new Set();

    return sites.map(url => {
      const path = url.pathname;
      const rawPageName = path === '/' ? 'home' : path.split('/').pop().replace('.html', '');
      const pageName = this.formatPageName(rawPageName) || 'Home';

      if (seenPageNames.has(pageName)) return null;
      seenPageNames.add(pageName);
      return { url, pageName };
    }).filter(Boolean);
  }

  async getPredictiveLeadScore(orgId: string, dateFilter: string, start?: string, end?: string) {
    const prisma = await this.getPrismaClient(orgId);
    const date = getDate(dateFilter, { start, end })

    const result = [0, 0, 0, 0, 0]
    const predictiveLeadScores = []
    try {
      const limit = 10;
      const response = (await this.handleException(
        await this.contactService.getContactsByDate(orgId, date.current.start, date.current.end, { limit, page: 1 }),
      ))
      let contacts = response.data;
      const total = response.total;
      const totalPage = Math.ceil(total / limit)
      let nextPage = 2;
      while (nextPage <= totalPage) {
        const _response = (await this.handleException(
          await this.contactService.getContactsByDate(orgId, date.current.start, date.current.end, { limit, page: nextPage }),
        ))
        contacts = contacts.concat(_response.data);
        nextPage++
      }
      for (const contact of contacts) {
        const icpScore = await prisma.icpScore.findFirst({ where: { contactId: contact.id } })
        if (contact.visitorId) {
          const visitor = await prisma.visitor.findUnique({ where: { id: contact.visitorId } })
          if (icpScore?.score && visitor?.score) {
            const average = (icpScore?.score + visitor?.score) / 2;
            predictiveLeadScores.push(average)
          } else if (icpScore?.score) {
            const average = (icpScore?.score + 20) / 2;
            predictiveLeadScores.push(average)
          } else if (visitor?.score) {
            const average = (visitor?.score + 20) / 2;
            predictiveLeadScores.push(average)
          }
          else {
            predictiveLeadScores.push(20)
          }
        } else {
          if (icpScore?.score) {
            const average = (icpScore?.score + 20) / 2;
            predictiveLeadScores.push(average)
          } else {
            predictiveLeadScores.push(20)
          }
        }
      }
      for (const score of predictiveLeadScores) {
        if (score >= 80) {
          result[4]++
        } else if (score >= 60) {
          result[3]++
        } else if (score >= 40) {
          result[2]++
        } else if (score >= 20) {
          result[1]++
        } else {
          result[0]++
        }
      }
      return {
        code: 200,
        success: true,
        message: 'Intent scores fetched successfully',
        data: result
      }
    } catch (err) {
      console.log(err);
    } finally {
      await prisma.$disconnect();
    }
  }

  async getIntentScore(orgId: string, dateFilter: string, start?: string, end?: string) {
    const prisma = await this.getPrismaClient(orgId);
    const date = getDate(dateFilter, { start, end })

    try {
      const result = [0, 0, 0]
      const intentScores = await prisma.visitor.findMany({
        where: {
          createdAt: {
            gte: date.current.start,
            lte: date.current.end,
          },
        }, select: { score: true }
      })
      const count = await prisma.visitor.count();
      for (const score of intentScores) {
        if (score.score >= 60) {
          result[0]++
        } else if (score.score >= 30) {
          result[1]++
        } else {
          result[2]++
        }
      }
      return {
        code: 200,
        success: true,
        message: 'Intent scores fetched successfully',
        data: result
      }
    } catch (error) {
      console.error('Error counting visits:', error);
      throw error;
    } finally {
      await prisma.$disconnect();
    }
  }

  async getChannelEnhancementMetrics(orgId: string, dateFilter: string, start?: string, end?: string) {
    const date = getDate(dateFilter, { start, end })
    try {
      const top5 = await this.getTop5Name(orgId, date)
      const top5Names = top5.map(entry => entry.source);
      const uniqueVisitorsBySource = await this.getUniqueVistorBySource(orgId, date, top5Names)
      const firstTouchPoint = await this.calculateFirstTouchPoint(top5, uniqueVisitorsBySource)
      const contactVisitIds = await this.contactService.getContactsVisitIds(orgId, date.current.start, date.current.end)
      const visitLastTouchPoint = await this.getLastTouchPoint(orgId, date, contactVisitIds)
      const lastTouchPoint = await this.calculateLastTouchPoint(top5, visitLastTouchPoint)
      console.log(top5Names, firstTouchPoint, lastTouchPoint);
      const response = {
        firstTouchPointValues: [],
        lastTouchPointValues: [],
        labels: []
      };

      top5Names.forEach(name => {
        const firstTouch = firstTouchPoint.find(entry => entry.source === name);
        const lastTouch = lastTouchPoint.find(entry => entry.source === name);
        response.labels.push(name);
        response.firstTouchPointValues.push(firstTouch ? parseFloat(firstTouch.firstTouchPoint) : 0);
        response.lastTouchPointValues.push(lastTouch ? parseFloat(lastTouch.lastTouchPoint) : 0);
      });
      return {
        code: 200,
        success: true,
        message: 'Channel enhancement metrics fetched successfully',
        data: response
      }
    } catch (err) {
      console.log(err);
    }
  }

  async getUniqueVistorBySource(orgId: string, date: any, top5Names: any) {
    const prisma = await this.getPrismaClient(orgId);
    try {
      const visits = await prisma.visit.findMany({
        where: {
          createdAt: {
            gte: date.current.start,
            lte: date.current.end
          }
        },
        select: {
          visitorId: true,
          source: true
        }
      });

      // Group by source and count unique visitorId values
      const uniqueVisitorsBySource = visits.reduce((acc, visit) => {
        const source = visit.source;
        const visitorId = visit.visitorId;

        if (!acc[source]) {
          acc[source] = new Set(); // Using a Set to ensure uniqueness
        }

        acc[source].add(visitorId);
        return acc;
      }, {});

      let others = 0;
      for (const source in uniqueVisitorsBySource) {
        if (top5Names.includes(source)) {
          uniqueVisitorsBySource[source] = uniqueVisitorsBySource[source].size;
        }
        else {
          others += uniqueVisitorsBySource[source].size;
          delete uniqueVisitorsBySource[source];
        }
      }
      if (others) {
        uniqueVisitorsBySource['others'] = others;
      }
      return uniqueVisitorsBySource;
    } catch (err) {
      console.log(err);
    } finally {
      await prisma.$disconnect();
    }
  }

  async getTop5Name(orgId: string, date: any) {
    const prisma = await this.getPrismaClient(orgId);
    try {
      const results = await prisma.visit.groupBy({
        by: ['source'],
        _count: {
          _all: true,
        },
        where: {
          createdAt: {
            gte: date.current.start,
            lte: date.current.end,
          },
        },
      });

      // Sort results by count in descending order
      results.sort((a, b) => b._count._all - a._count._all);

      // Get the top 4 entries
      const top5 = results.slice(0, 4);

      // Calculate the total count for "others"
      const othersCount = results.slice(4).reduce((sum, entry) => sum + entry._count._all, 0);

      // Add the "others" entry if there are more than 4 entries
      if (results.length > 4) {
        top5.push({
          _count: { _all: othersCount },
          source: 'others',
        });
      }

      return top5;
    } catch (err) {
      console.log(err);
    } finally {
      await prisma.$disconnect();
    }
  }

  async getLastTouchPoint(orgId: string, date: any, visitIds: any) {
    const prisma = await this.getPrismaClient(orgId);
    try {
      const visits = await prisma.visit.findMany({
        where: {
          id: { in: visitIds },
          createdAt: {
            gte: date.current.start,
            lte: date.current.end
          }
        },
        select: {
          source: true
        }
      })
      const result = {}
      for (const visit of visits) {
        result[visit.source] = (result[visit.source] || 0) + 1
      }
      return result;
    } catch (err) {
      console.log(err);
    } finally {
      await prisma.$disconnect();
    }
  }

  async calculateFirstTouchPoint(top5Names: any, uniqueVisitorsBySource: any) {
    const result = []
    for (const source of top5Names) {
      const totalVisit = source._count._all;
      const uniqueVisit = uniqueVisitorsBySource[source.source];
      const firstTouchPoint = ((uniqueVisit / totalVisit) * 100) || 0;
      result.push({
        source: source.source,
        firstTouchPoint: firstTouchPoint.toFixed(2)
      });
    }
    return result;
  }

  async calculateLastTouchPoint(top5Names: any, visitIds: any) {
    const result = []
    for (const source of top5Names) {
      const totalVisit = source._count._all;
      const lastTouchPoint = ((visitIds[source.source] / totalVisit) * 100) || 0;
      result.push({
        source: source.source,
        lastTouchPoint: lastTouchPoint.toFixed(2)
      });
    }
    return result
  }

  async getPipelineValueGenerator(orgId: string, dateFilter: string, start?: string, end?: string) {
    const date = getDate(dateFilter, { start, end })
    const prisma = await this.getPrismaClient(orgId);
    try {
      const top5 = await this.getTop5Name(orgId, date)
      const top5Names = top5.map(entry => entry.source);
      const uniqueVisitorsBySource = await this.getUniqueVistorBySource(orgId, date, top5Names)
      const dashboardData = await prisma.dashboard.findFirst();
      const { averageDealSize } = dashboardData;
      const pipelineValueBySource = await this.getPipelineValueBySource(uniqueVisitorsBySource, averageDealSize)
      const result = {
        column: top5Names.map(name => uniqueVisitorsBySource[name]),
        line: top5Names.map(name => pipelineValueBySource[name]),
        labels: top5Names
      };
      return {
        code: 200,
        success: true,
        message: 'Pipeline value fetched successfully',
        data: result
      }
    } catch (err) {
      console.log(err);
    } finally {
      await prisma.$disconnect();
    }
  }

  async getPipelineValueBySource(uniqueVisitorsBySource: any, averageDealSize: any) {
    const result = {}
    for (const source in uniqueVisitorsBySource) {
      result[source] = uniqueVisitorsBySource[source] * averageDealSize
    }
    return result;
  }
}
