import { Injectable, OnModuleInit } from '@nestjs/common';
import { BaseService } from 'src/common/services/base.service';
import { ContactsService } from 'src/contacts/contacts.service';
import { DashbaordDto } from './dto/dashboard.dto';
import { AccountsService } from 'src/accounts/accounts.service';
import { ProspecActivityType } from 'src/prospect-journey/dto/create-prospect-journey.dto'
import { ContactService } from 'src/microservices/crm_service/contact.service';
import { DashboardDataDto } from './dto/dashboardData.dto';
@Injectable()
export class DashboardService extends BaseService {

  constructor(
    private readonly contactsService: ContactsService,
    private readonly accountsService: AccountsService,
    private readonly contactService: ContactService,
  ) {
    super()
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

  async getBottomWidget(orgId: string) {
    try {
     
      const {startOfMonthISO, endOfMonthISO, startOfPreviousMonthISO, endOfPreviousMonthISO} = await this.getDates()
      const currentMonthVisitCount = await this.getVisitCount(orgId, startOfMonthISO, endOfMonthISO);
      const previousMonthVisitCount = await this.getVisitCount(orgId, startOfPreviousMonthISO, endOfPreviousMonthISO);
      const currentMonthContactCount = await this.getContactCount(orgId, startOfMonthISO, endOfMonthISO);
      const previousMonthContactCount = await this.getContactCount(orgId, startOfPreviousMonthISO, endOfPreviousMonthISO);
      const currentMonthAccountCount = await this.getAccountCount(orgId, startOfMonthISO, endOfMonthISO);
      const previousMonthAccountCount = await this.getAccountCount(orgId, startOfPreviousMonthISO, endOfPreviousMonthISO);

      return {
        code: 200,
        success: true,
        message: 'Contacts fetched successfully',
        data: {
          currentMonthVisitCount,
          previousMonthVisitCount,
          currentMonthContactCount,
          previousMonthContactCount,
          currentMonthAccountCount,
          previousMonthAccountCount,
        }
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

  async getDates(){
    const currentDate = new Date();

    // Calculate start and end dates for the current month
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    // Calculate start and end dates for the previous month
    const startOfPreviousMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    const endOfPreviousMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);

    // Convert dates to ISO strings
    const startOfMonthISO = startOfMonth.toISOString();
    const endOfMonthISO = endOfMonth.toISOString();
    const startOfPreviousMonthISO = startOfPreviousMonth.toISOString();
    const endOfPreviousMonthISO = endOfPreviousMonth.toISOString();
    return {
      startOfMonthISO,
      endOfMonthISO,
      startOfPreviousMonthISO,
      endOfPreviousMonthISO
    }
  }
  
  async getTopWidget(orgId: string) {
    try{
      const {startOfMonthISO, endOfMonthISO, startOfPreviousMonthISO, endOfPreviousMonthISO} = await this.getDates()

      const currentPVG = await this.calculatePVG(orgId, startOfMonthISO, endOfMonthISO);
      const currentCAC = await this.calculateCAC(orgId, startOfMonthISO, endOfMonthISO);
      const currentCPL = await this.calculateCPL(orgId, startOfMonthISO, endOfMonthISO);

      const previousPVG = await this.calculatePVG(orgId, startOfPreviousMonthISO, endOfPreviousMonthISO);
      const previousCAC = await this.calculateCAC(orgId, startOfPreviousMonthISO, endOfPreviousMonthISO);
      const previousCPL = await this.calculateCPL(orgId, startOfPreviousMonthISO, endOfPreviousMonthISO);

      return {
        code: 200,
        success: true,
        message: 'Top widget data fetched successfully',
        data: {
          currentPVG,
          previousPVG,
          currentCAC,
          previousCAC,
          currentCPL,
          previousCPL
        }
      };
    }catch(error){
      console.log(error)
    }
}

  async calculatePVG(orgId:string, startOfMonthISO: string, endOfMonthISO: string){
      const prisma = await this.getPrismaClient(orgId)
      try{
        const dashboardData = await prisma.dashboard.findFirst();
        if(!dashboardData){
           return 0;
        }
        const { averageDealSize, leadConversionRate}=dashboardData
        const totalLeads = await this.getContactCount(orgId,startOfMonthISO,endOfMonthISO);
        const pipelineValue = totalLeads * averageDealSize * leadConversionRate;
        return pipelineValue
      } catch(error){

      } finally{
         await prisma.$disconnect()
      }
  }

  async calculateCAC(orgId:string,  startOfMonthISO: string, endOfMonthISO: string){
    const prisma = await this.getPrismaClient(orgId)
    try{
      const dashboardData = await prisma.dashboard.findFirst();
      if(!dashboardData){
         return 0;
      }
      const { salesCost, marketingCost}=dashboardData
      const totalLeads = await this.getContactCount(orgId,startOfMonthISO,endOfMonthISO);
      if(totalLeads===0 || (salesCost===0 && marketingCost===0)){
        return 0;
      }
      const cac = (marketingCost + salesCost) / totalLeads;
      return cac
    } catch(error){

    } finally{
       await prisma.$disconnect()
    }
  }

  async calculateCPL(orgId:string, startOfMonthISO: string, endOfMonthISO: string){
    const prisma = await this.getPrismaClient(orgId)
    try{
      const dashboardData = await prisma.dashboard.findFirst();
      if(!dashboardData){
         return 0;
      }
      const { marketingCost}=dashboardData
      const totalLeads = await this.getContactCount(orgId, startOfMonthISO, endOfMonthISO);
      if(totalLeads===0 || marketingCost===0){
        return 0;
      }
      const cplValue = marketingCost / totalLeads;
      return cplValue
    } catch(error){

    } finally{
       await prisma.$disconnect()
    }
  }

  async getPageEnhancementMetrics(orgId: string) {
    const prisma = await this.getPrismaClient(orgId);
    try {
      let result = [];
      const sites = await prisma.site.findMany({ select: { url: true } });
      const siteMap = this.getPageNames(sites);
      const prospectJourney = await prisma.prospectJourney.findMany({
        where: {
          OR: [
            { type: ProspecActivityType.PAGE_VIEWED },
            { type: ProspecActivityType.PAGE_CLOSED },
            { type: ProspecActivityType.CTA_PERFORMED }
          ]
        }, select: { url: true, scrollDepth: true, timeSpend: true, type: true }
      });
      console.log(prospectJourney);

      for (const site of sites) {

      }
    } catch (error) {
      console.error('Error counting visits:', error);
      throw error;
    } finally {
      await prisma.$disconnect();
    }
  }

  formatPageName(pageName) {
    // Replace dashes and underscores with spaces
    let formattedName = pageName.replace(/[-_]/g, ' ');

    // Capitalize the first letter of each word
    formattedName = formattedName.replace(/\b\w/g, char => char.toUpperCase());

    return formattedName;
  }

  getPageNames(sites) {
    return sites.map(site => {
      const url = new URL(site.url);
      const path = url.pathname;
      const rawPageName = path === '/' ? 'home' : path.split('/').pop().replace('.html', '');

      const pageName = this.formatPageName(rawPageName);

      return {
        url: site.url,
        pageName: pageName
      };
    });
  }

  async getPredictiveLeadScore(orgId: string) {
    const prisma = await this.getPrismaClient(orgId);
    const result = [0, 0, 0, 0, 0]
    const predictiveLeadScores = []
    try {
      const limit = 10;
      const response = (await this.handleException(
        await this.contactService.getContacts(orgId, { limit, page: 1 }),
      ))
      let contacts = response.data;
      const total = response.total;
      const totalPage = Math.ceil(total / limit)
      let nextPage = 2;
      while (nextPage <= totalPage) {
        const _response = (await this.handleException(
          await this.contactService.getContacts(orgId, { limit, page: nextPage }),
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

  async getIntentScore(orgId: string) {
    const prisma = await this.getPrismaClient(orgId);
    try {
      const result = [0, 0, 0]
      const intentScores = await prisma.visitor.findMany({ select: { score: true } })
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

  async getChannelEnhancementMetrics(orgId: string) {

  }

  async getPipelineValueGenerator(orgId: string) {

  }
}
