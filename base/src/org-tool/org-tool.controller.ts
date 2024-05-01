import { Controller, Get, Post, Put, Delete, Param, Body, Patch, UseGuards, Req, UnauthorizedException } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { OrgToolService } from './org-tool.service';
import { CreateOrgToolDto } from './dto/create-org-tool.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ZautoRequest } from 'src/common/models/request.model';

@ApiTags('Org Tools')
@Controller('api/org-tools')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class OrgToolController {
    constructor(private readonly orgToolService: OrgToolService) {}

    @Post()
    async create(@Body() createOrgToolDto: CreateOrgToolDto) {
        return this.orgToolService.create(createOrgToolDto);
    }

    @Get()
    async findAll(@Req() request: ZautoRequest) {
        if(request.user && request.user.org)
        {
            const orgId = request.user.org.id;
            return this.orgToolService.findAllByOrg(orgId);
        }
        else
        {
            throw new UnauthorizedException("Unauthorised access.")
        }
    }

    @Get('name/:name')
    async getToolByName(@Param('name') name: string,@Req() request: ZautoRequest) {
        if(request.user && request.user.org)
        {
            const orgId = request.user.org.id;
            return this.orgToolService.findByToolName(name,orgId);
        }
        else
        {
            throw new UnauthorizedException("Unauthorised access.")
        }
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.orgToolService.findOne(id);
    }

    @Patch(':id')
    async update(@Param('id') id: string, @Body() createOrgToolDto: CreateOrgToolDto) {
        return this.orgToolService.update(id, createOrgToolDto);
    }

    @Delete(':id')
    async remove(@Param('id') id: string) {
        return this.orgToolService.remove(id);
    }
}
