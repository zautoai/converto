import { Body, Controller, Get, Put, Query, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ZautoRequest } from 'src/common/models/request.model';
import { DashboardService } from './dashboard.service';
import { DashboardDataDto } from './dto/dashboardData.dto';
import { DateFilter } from 'src/common/enums/enums';


@ApiTags('Dashboards')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('api/dashboards')
export class DashboardController {
    constructor(private readonly dashboardService: DashboardService) { }

    @Get()
    async getDashboardData(@Req() request: ZautoRequest) {
        const orgId = request.user.orgId;
        if (!orgId) {
            throw new UnauthorizedException('Org Id not found');
        }
        return await this.dashboardService.getDashboardData(orgId);
    }

    @Put()
    async updateDashboardData(@Req() request: ZautoRequest,@Body() dashboardDataDto:DashboardDataDto){
        const orgId = request.user.orgId;
        if (!orgId) {
            throw new UnauthorizedException('Org Id not found');
        }
        return await this.dashboardService.changeDashboardData(orgId,dashboardDataDto)
    }

    @Get('top-widget')
    async getTopWidget(@Req() request: ZautoRequest, @Query('dateFilter') dateFilter: DateFilter, @Query('start') start?: string, @Query('end') end?: string) {
        const orgId = request.user.orgId;
        if (!orgId) {
            throw new UnauthorizedException('Org Id not found');
        }
        if (!start || !end) {
            return await this.dashboardService.getTopWidget(orgId, dateFilter);
        }
        return await this.dashboardService.getTopWidget(orgId, dateFilter, start, end);
    }


    @Get('bottom-widget')
    async getBottomWidget(@Req() request: ZautoRequest, @Query('dateFilter') dateFilter: DateFilter, @Query('start') start?: string, @Query('end') end?: string) {
        const orgId = request.user.orgId;
        if (!orgId) {
            throw new UnauthorizedException('Org Id not found');
        }
        if (!start || !end) {
            return await this.dashboardService.getBottomWidget(orgId, dateFilter);
        }
        return await this.dashboardService.getBottomWidget(orgId, dateFilter, start, end);
    }

    @Get('page-enhancement-metrics')
    async getPageEnhancementMetrics(@Req() request: ZautoRequest, @Query('dateFilter') dateFilter: string, @Query('start') start?: string, @Query('end') end?: string) {
        const orgId = request.user.orgId;
        if (!orgId) {
            throw new UnauthorizedException('Org Id not found');
        }
        if (!start || !end) {
            return await this.dashboardService.getPageEnhancementMetrics(orgId, dateFilter);
        }
        return await this.dashboardService.getPageEnhancementMetrics(orgId, dateFilter, start, end);
    }

    @Get('predictive-lead-score')
    async getPredictiveLeadScore(@Req() request: ZautoRequest, @Query('dateFilter') dateFilter: string, @Query('start') start?: string, @Query('end') end?: string) {
        const orgId = request.user.orgId;
        if (!orgId) {
            throw new UnauthorizedException('Org Id not found');
        }
        if (!start || !end) {
            return await this.dashboardService.getPredictiveLeadScore(orgId, dateFilter);
        }
        return await this.dashboardService.getPredictiveLeadScore(orgId,dateFilter,start,end);
    }

    @Get('intent-score')
    async getIntentScore(@Req() request: ZautoRequest, @Query('dateFilter') dateFilter: string, @Query('start') start?: string, @Query('end') end?: string) {
        const orgId = request.user.orgId;
        if (!orgId) {
            throw new UnauthorizedException('Org Id not found');
        }
        if (!start || !end) {
            return await this.dashboardService.getIntentScore(orgId, dateFilter);
        }
        return await this.dashboardService.getIntentScore(orgId, dateFilter, start, end);
    }

    @Get('channel-enhancement-metrics')
    async getChannelEnhancementMetrics(@Req() request: ZautoRequest, @Query('dateFilter') dateFilter: DateFilter, @Query('start') start?: string, @Query('end') end?: string) {
        const orgId = request.user.orgId;
        if (!orgId) {
            throw new UnauthorizedException('Org Id not found');
        }
        if (!start || !end) {
            return await this.dashboardService.getChannelEnhancementMetrics(orgId, dateFilter);
        }
        return await this.dashboardService.getChannelEnhancementMetrics(orgId, dateFilter, start, end);
    }

    @Get('pipeline-value-generator')
    async getPipelineValueGenerator(@Req() request: ZautoRequest, @Query('dateFilter') dateFilter: DateFilter, @Query('start') start?: string, @Query('end') end?: string) {
        const orgId = request.user.orgId;
        if (!orgId) {
            throw new UnauthorizedException('Org Id not found');
        }
        if (!start || !end) {
            return await this.dashboardService.getPipelineValueGenerator(orgId, dateFilter);
        }
        return await this.dashboardService.getPipelineValueGenerator(orgId, dateFilter, start, end);
    }
}


