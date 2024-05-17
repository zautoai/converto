import { Controller, Get, Post, Body, Param, Put, Delete, Req, UnauthorizedException, UseGuards, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CrmKeyMapingService } from './crm-key-maping.service';
import { UpdateKeyMappingDto } from './dto/update-maping.dto';
import { CreateKeyMappingDto } from './dto/create-maping.sto';
import { ZautoRequest } from 'src/common/models/request.model';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@ApiTags('CRM KeyMapping')
@Controller('api/crm-key-maping')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class CrmKeyMapingController {
    constructor(private readonly keyMappingService: CrmKeyMapingService) {}

    @Get('properties/:provider')
    async getZautoColumns(@Param('provider') provider: string, @Req() request: ZautoRequest)
    {
        if(request.user && request.orgId)
        {
            const orgId = request.orgId;
            const userId = request.user.id;
            return await this.keyMappingService.getProperties(orgId,provider,userId);
        }
        else
        {
            throw new UnauthorizedException("Unauthorised access.")
        }
    }

    @Post(':toolId')
    async create(@Param('toolId') toolId: string, @Body() createKeyMappingDto: CreateKeyMappingDto, @Req() request: ZautoRequest) {
        if(request.user && request.orgId)
        {
            createKeyMappingDto.orgToolId = toolId;
            createKeyMappingDto.orgId = request.orgId;
            return await this.keyMappingService.create(createKeyMappingDto);
        }
        else
        {
            throw new UnauthorizedException("Unauthorised access.")
        }

    }

    @Get(':toolId')
    async findAll(@Param('toolId') toolId: string, @Req() request: ZautoRequest) {
        if(request.user && request.orgId)
        {
            const orgId = request.orgId;
            return await this.keyMappingService.findAll(orgId, toolId);
        }
        else
        {
            throw new UnauthorizedException("Unauthorised access.")
        }
    }

    @Get(':toolId/:id')
    async findOne(@Param('toolId') toolId: string, @Param('id') id: string) {
        return await this.keyMappingService.findOne(id);
    }

    @Patch(':toolId/:id')
    async update(@Param('toolId') toolId: string,@Param('id') id: string, @Body() updateKeyMappingDto: UpdateKeyMappingDto) {
        return await this.keyMappingService.update(id, updateKeyMappingDto);
    }

    @Delete(':toolId/:id')
    async remove(@Param('toolId') toolId: string,@Param('id') id: string) {
        return await this.keyMappingService.remove(id);
    }

}
