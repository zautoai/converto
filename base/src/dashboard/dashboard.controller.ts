import { Body, Controller, Get, Put, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ZautoRequest } from 'src/common/models/request.model';
import { DashboardService } from './dashboard.service';
import { DashboardDataDto } from './dto/dashboardData.dto';


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
    async getTopWidget(@Req() request: ZautoRequest) {
        const orgId = request.user.orgId;
        if (!orgId) {
            throw new UnauthorizedException('Org Id not found');
        }
        return await this.dashboardService.getTopWidget(orgId);
    }


    @Get('bottom-widget')
    async getBottomWidget(@Req() request: ZautoRequest) {
        const orgId = request.user.orgId;
        if (!orgId) {
            throw new UnauthorizedException('Org Id not found');
        }
        return await this.dashboardService.getBottomWidget(orgId);
    }

    @Get('page-enhancement-metrics')
    async getPageEnhancementMetrics(@Req() request: ZautoRequest) {
        const orgId = request.user.orgId;
        if (!orgId) {
            throw new UnauthorizedException('Org Id not found');
        }
        return await this.dashboardService.getPageEnhancementMetrics(orgId);
    }

    @Get('predictive-lead-score')
    async getPredictiveLeadScore(@Req() request: ZautoRequest) {
        const orgId = request.user.orgId;
        if (!orgId) {
            throw new UnauthorizedException('Org Id not found');
        }
        return await this.dashboardService.getPredictiveLeadScore(orgId);
    }

    @Get('intent-score')
    async getIntentScore(@Req() request: ZautoRequest) {
        const orgId = request.user.orgId;
        if (!orgId) {
            throw new UnauthorizedException('Org Id not found');
        }
        return await this.dashboardService.getIntentScore(orgId);
    }

    @Get('channel-enhancement-metrics')
    async getChannelEnhancementMetrics(@Req() request: ZautoRequest) {
        const orgId = request.user.orgId;
        if (!orgId) {
            throw new UnauthorizedException('Org Id not found');
        }
        return await this.dashboardService.getChannelEnhancementMetrics(orgId);
    }

    @Get('pipeline-value-generator')
    async getPipelineValueGenerator(@Req() request: ZautoRequest) {
        const orgId = request.user.orgId;
        if (!orgId) {
            throw new UnauthorizedException('Org Id not found');
        }
        return await this.dashboardService.getPipelineValueGenerator(orgId);
    }
}


