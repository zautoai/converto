import { Controller, Get, Query, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ZautoRequest } from 'src/common/models/request.model';
import { DashboardService } from './dashboard.service';
import { DashbaordDto } from './dto/dashboard.dto';


@ApiTags('Dashboards')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('api/dashboards')
export class DashboardController {
    constructor(private readonly dashboardService: DashboardService) { }

    @Get()
    async mainDashboard(@Query() dashboardDto: DashbaordDto, @Req() zautoRequest: ZautoRequest) {
        if (zautoRequest.user && zautoRequest.orgId) {
            const orgId = zautoRequest.orgId;
            const widgets = Array.isArray(dashboardDto.widget) ? dashboardDto.widget : [dashboardDto.widget].filter(Boolean);
            let data = {};
            if (widgets.includes('agent')) {
                const agentData = new DashCardData();
                agentData.max = 10;
                agentData.count = await this.dashboardService.getAgentsCount(orgId);
                data = { ...data, agent: agentData };
            }
            if (widgets.includes('user')) {
                const count = await this.dashboardService.getUsersCount(orgId);
                const agentData = new DashCardData(count, 5);
                data = { ...data, user: agentData };
            }
            
            if (widgets.includes('campaign')) {
                const count = await this.dashboardService.getCampaignCount(orgId);
                const campaignData = new DashCardData(count, 10);
                data = { ...data, campaign: campaignData };
            }
            if (widgets.includes('message')) {
                const count = await this.dashboardService.getMessagesCount(orgId);
                const messageData = new DashCardData(count, 5000);
                data = { ...data, message: messageData };
            }
            if (widgets.includes('site')) {
                const count = await this.dashboardService.getSitesCount(orgId);
                const siteData = new DashCardData(count, 100);
                data = { ...data, site: siteData };
            } if(widgets.includes('visitByDate')) {
                const visitByDateData = await this.dashboardService.getVisitCountByDate(orgId,dashboardDto);
                data = { ...data, visitByDate: visitByDateData };
            } if(widgets.includes('visitBySource')) {
                const visitBySourceData = await this.dashboardService.getVisitCountByPlatform(orgId,dashboardDto);
                data = { ...data, visitBySource: visitBySourceData };
            } if(widgets.includes('leadByDate')) {
                const leadByDateData = await this.dashboardService.getLeadCountByDate(orgId,dashboardDto);
                data = { ...data, leadByDate: leadByDateData };
            } if(widgets.includes('leadBySource')) {
                const leadBySourceData = await this.dashboardService.getLeadCount(orgId,dashboardDto);
                data = { ...data, leadBySource: leadBySourceData };
            }

            data = { ...data };
            return data;
        }
        else {
            throw new UnauthorizedException("Unauthorised access.")
        }
    }

    @Get('counts')
    async getCount(@Query() dashboardDto: DashbaordDto,@Req() zautoRequest: ZautoRequest) {
        if (zautoRequest.user && zautoRequest.orgId) {
            const orgId = zautoRequest.orgId;
            return await this.dashboardService.getCounts(orgId,dashboardDto);
        }
        else {
            throw new UnauthorizedException("Unauthorised access.")
        }
    }

    @Get('chart')
    async getChart(@Query() dashboardDto: DashbaordDto, @Req() zautoRequest: ZautoRequest) {
        if (zautoRequest.user && zautoRequest.orgId) {
            const orgId = zautoRequest.orgId;
            return await this.dashboardService.getChart(orgId, dashboardDto);
        }
        else {
            throw new UnauthorizedException("Unauthorised access.")
        }
    }

    @Get('top-campaigns')
    async getTopCampaigns(@Query() dashboardDto: DashbaordDto, @Req() zautoRequest: ZautoRequest) {
        if (zautoRequest.user && zautoRequest.orgId) {
            const orgId = zautoRequest.orgId;
            return await this.dashboardService.getTopCampaigns(orgId, dashboardDto);
        }
        else {
            throw new UnauthorizedException("Unauthorised access.")
        }
    }
}

export class DashCardData {
    count: number = 0;
    max: number = 999999;
    constructor(count?: number, max?: number) {
        this.count = count || 0;
        this.max = max || 999999;
    }
}

export class DashChartData{
    datasets: any[] = [];
    labels: string[] = [];
}


