import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiNoContentResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from 'src/auth/roles.decorator';
import { SYSTEM_CONST } from 'src/common/constants/system.constants';
import { ExternalApiKeyMappingService } from './external-api-key-mapping.service';
import { ExternalApiKeyMapping } from './entites/external-api-keymapping.enity';
import { CreateExternalApiKeyMappingDto } from './dto/update-external-api.keymapping.dto';
import { ZautoRequest } from 'src/common/models/request.model';
import { UpdateExternalApiKeyMappingDto } from './dto/create-external-api.keymapping.dto';
import { ResponseDTO } from 'src/common/dto/response.dto';

@ApiTags('External API key mapping')
@Controller('api/:externalApiId/external-api-keymapping')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Roles(SYSTEM_CONST.ADMIN_ROLE, SYSTEM_CONST.SUPERUSER_ROLE)
export class ExternalApiKeyMappingController {

    constructor(private readonly externalApiKeyMappingService: ExternalApiKeyMappingService) {}

    @Post()
    @ApiOkResponse({type: ExternalApiKeyMapping})
    async create(@Param('externalApiId') externalApiId: string,@Body() createExternalApiKeyMappingDto: CreateExternalApiKeyMappingDto, @Req() request: ZautoRequest) {
        if(request.user && request.orgId)
        {
            createExternalApiKeyMappingDto.orgId = request.orgId;
            createExternalApiKeyMappingDto.apiId = externalApiId;
            return await this.externalApiKeyMappingService.create(createExternalApiKeyMappingDto);
        }
        else
        {
            throw new UnauthorizedException("Unauthorised access.")
        }
    }

    @Get()
    @ApiOkResponse({type: ResponseDTO<ExternalApiKeyMapping>})
    async findAll(@Param('externalApiId') externalApiId: string,@Req() request: ZautoRequest){
        if(request.user && request.orgId)
        {
            const orgId = request.orgId;
            return await this.externalApiKeyMappingService.findAllByApi(externalApiId);
        }
        else
        {
            throw new UnauthorizedException("Unauthorised access.")
        }
    }

    @Get(':id')
    @ApiOkResponse({type: ExternalApiKeyMapping})
    async findOne(@Param('externalApiId') externalApiId: string, @Param('id') id: string) {
        return await this.externalApiKeyMappingService.findOne(id);
    }

    @Patch(':id')
    @ApiOkResponse({type: ExternalApiKeyMapping})
    async update(@Param('externalApiId') externalApiId: string, 
    @Param('id') id: string, 
    @Body() updateExternalApiKeyMappingDto: UpdateExternalApiKeyMappingDto) {
        return await this.externalApiKeyMappingService.update(id, updateExternalApiKeyMappingDto);
    }

    @Delete(':id')
    @ApiNoContentResponse()
    @HttpCode(204)
    async remove(@Param('externalApiId') externalApiId: string, @Param('id') id: string) {
        await this.externalApiKeyMappingService.remove(id);
    }
}
