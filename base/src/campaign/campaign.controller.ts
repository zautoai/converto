import { Body, Controller, Delete, Get, HttpCode, NotAcceptableException, Param, Patch, Post, Query, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import { SYSTEM_CONST } from 'src/common/constants/system.constants';
import { CreateCampaignDto } from './dto/create-campaign.dot';
import { ZautoRequest } from 'src/common/models/request.model';
import { CampaignService } from './campaign.service';
import { Campaign } from './entities/campaign.entity';
import { UpdateCampaignDto } from './dto/update.campaign.dto';
import { CampaignFilterDto } from './dto/campaign-filter.dto';
import { UsageService } from 'src/account/usage.service';

@ApiTags('Campaigns')
@Roles(SYSTEM_CONST.ADMIN_ROLE, SYSTEM_CONST.SUPERUSER_ROLE)
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@Controller('api/campaigns')
export class CampaignController 
{

    constructor(
        private readonly campaignService:CampaignService,
        private readonly usageService: UsageService){}

    @Get()
    @ApiQuery({ name: 'page', description: 'Page number.', required: false })
    @ApiQuery({ name: 'limit', description: 'Number of records in a page.', required: false })
    async findAll(@Query() campaignFilterDto: CampaignFilterDto,@Req() req: ZautoRequest)
    {
        if(req.user && req.orgId)
        {
            const orgId = req.orgId;
            return await this.campaignService.findAllByOrg({orgId,data:campaignFilterDto});
        }
        else
        {
            throw new UnauthorizedException("Unauthorised access.")
        }
    }

    @Get(':id')
    @ApiOkResponse({type:Campaign})
    async findOne(@Param('id') id: string,@Req() req: ZautoRequest)
    {
        const orgId = req.orgId;
        return await this.campaignService.findOne(orgId,id);
    }

    @Post()
    @ApiOkResponse({type:Campaign})
    async create(@Body() createCampaignDto:CreateCampaignDto,@Req() req: ZautoRequest)
    {
        if(req.user && req.orgId)
        {
            const orgId = req.orgId;
            const currentDate = new Date().toISOString();
            const campaignUsage = await this.usageService.getCampaginCount(orgId,currentDate);
            const remainingCampaign = campaignUsage.maxCount - campaignUsage.count;

            if(remainingCampaign <= 0)
            {
                throw new NotAcceptableException(`Remaining campaign ${remainingCampaign}`);
            }
            createCampaignDto.orgId = req.orgId;
            return await this.campaignService.create({orgId, data: createCampaignDto});
        }
        else
        {
            throw new UnauthorizedException("Unauthorised access.")
        }
    }

    @Patch(':id')
    @ApiOkResponse({type:Campaign})
    async update(@Param('id') id: string,@Body() updateCampaignDto: UpdateCampaignDto,@Req() req: ZautoRequest) {
        const orgId = req.orgId;
        return await this.campaignService.update({orgId,data:updateCampaignDto,id});
    }

    @Delete(':id')
    async delete(@Param('id') id: string,@Req() req: ZautoRequest)
    {
        const orgId = req.orgId;
        return await this.campaignService.delete(orgId,id);
    }

    @Get(':id/stats')
    async getStats(@Param('id') id: string,@Req() req: ZautoRequest) {
        try {
            const orgId = req.orgId;
            const visitByDate = await this.campaignService.getVisitsCountByDate(orgId,id);
            const leadByDate = await this.campaignService.getLeadCountByDate(orgId,id);
            return {
                visitByDate,
                leadByDate
            }
        } catch(error) {
            console.log(error)
        }
    }

    @Get(':id/counts')
    async getCounts(@Param('id') id: string,@Req() req: ZautoRequest)
    {
        const orgId = req.orgId;
        return await this.campaignService.getCounts(orgId,id);
    }
    
}
