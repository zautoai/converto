import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CallToActionService } from './call-to-action.service';
import { CreateCTADto } from './dto/create-cta.dto';
import { ZautoRequest } from 'src/common/models/request.model';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { UpdateCTADto } from './dto/update-cta.dto';
import { CallToAction } from './entities/cta.entity';

@ApiTags('Call To Action')
@Controller('api/cta')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CallToActionController {

    constructor (
        private readonly callToActionService: CallToActionService,
    ){}

    @Post('generate')
    async generateCTA(@Req() req: ZautoRequest)
    {
        if(req.user && req.user.orgId)
        {
            return await this.callToActionService.generateCTA(req.user.orgId);
        }
        else
        {
            throw new UnauthorizedException("Unauthorised access.");
        }
    }

    @Post('select')
    async select(@Body() selectCTADto:any,@Req() req: ZautoRequest)
    {
        if(req.user && req.user.orgId)
        {
            return await this.callToActionService.selectCTA(req.user.orgId,selectCTADto);
        }
        else
        {
            throw new UnauthorizedException("Unauthorised access.");
        }
    }

    @Post()
    @ApiOkResponse({type: CallToAction})
    async create(@Body() createCTADto: CreateCTADto, @Req() req: ZautoRequest)
    {
        if(req.user && req.user.orgId)
        {
            createCTADto.orgId = req.user.orgId;
            return await this.callToActionService.create(createCTADto);
        }
        else
        {
            throw new UnauthorizedException("Unauthorised access.");
        }
    }

    @Get()
    @ApiQuery({ name: 'page', description: 'Page number.', required: false })
    @ApiQuery({ name: 'limit', description: 'Number of records in a page.', required: false })
    @ApiOkResponse({type: CallToAction})
    async findAll(@Req() req: ZautoRequest,@Query() paginationDto: PaginationDto)
    {
        if(req.user && req.user.orgId)
        {
            return await this.callToActionService.findAll(req.user.orgId,paginationDto);
        }
        else
        {
            throw new UnauthorizedException("Unauthorised access.");
        }
    }

    @Get(':id')
    @ApiOkResponse({type: CallToAction})
    async find(@Param('id') id: string,@Req() req: ZautoRequest)
    {
        if(req.user && req.user.orgId)
        {
            return await this.callToActionService.find(id);
        }
        else
        {
            throw new UnauthorizedException("Unauthorised access.");
        }
    }

    @Patch(':id')
    @ApiOkResponse()
    async update(@Param('id') id: string,@Body() updateCTADto: UpdateCTADto,@Req() req: ZautoRequest)
    {
        if(req.user && req.user.orgId)
        {
            return await this.callToActionService.update(id,updateCTADto);
        }
        else
        {
            throw new UnauthorizedException("Unauthorised access.");
        }
    }

    @Delete(':id')
    @HttpCode(204)
    async delete(@Param('id') id: string,@Req() req: ZautoRequest)
    {
        if(req.user && req.user.orgId)
        {
            return await this.callToActionService.delete(id);
        }
        else
        {
            throw new UnauthorizedException("Unauthorised access.");
        }
    }

}
