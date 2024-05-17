import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiNoContentResponse, ApiOkResponse, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from 'src/auth/roles.decorator';
import { SYSTEM_CONST } from 'src/common/constants/system.constants';
import { ExternalApiService } from './external-api.service';
import { CreateExternalApiDto } from './dto/create-external-api.dto';
import { UpdateExternalApiDto } from './dto/update-external-api.dto';
import { ExternalApi } from './entites/externalApi.entity';
import { ZautoRequest } from 'src/common/models/request.model';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { ResponseDTO } from 'src/common/dto/response.dto';

@ApiTags('External APIs')
@Controller('api/external-apis')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Roles(SYSTEM_CONST.ADMIN_ROLE, SYSTEM_CONST.SUPERUSER_ROLE)
export class ExternalApiController {

    constructor(private readonly externalApiService: ExternalApiService) {}

    @Post()
    @ApiOkResponse({type: ExternalApi})
    async create(@Body() createExternalApiDto: CreateExternalApiDto, @Req() request: ZautoRequest) {
        if(request.user && request.orgId)
        {
            createExternalApiDto.orgId = request.orgId;
            return await this.externalApiService.create(createExternalApiDto);
        }
        else
        {
            throw new UnauthorizedException("Unauthorised access.")
        }
    }

    @Get()
    @ApiQuery({ name: 'page', description: 'Page number.', required: false })
    @ApiQuery({ name: 'limit', description: 'Number of records in a page.', required: false })
    @ApiOkResponse({type: ResponseDTO<ExternalApi>})
    async findAll(@Req() request: ZautoRequest, @Query() pagination: PaginationDto){
        if(request.user && request.orgId)
        {
            const orgId = request.orgId;
            return await this.externalApiService.findAllByOrg(orgId,pagination);
        }
        else
        {
            throw new UnauthorizedException("Unauthorised access.")
        }
    }

    @Get(':id')
    @ApiOkResponse({type: ExternalApi})
    async findOne(@Param('id') id: string) {
        return await this.externalApiService.findOne(id);
    }

    @Patch(':id')
    @ApiOkResponse({type: ExternalApi})
    async update(@Param('id') id: string, @Body() updateExternalApiDto: UpdateExternalApiDto) {
        return await this.externalApiService.update(id, updateExternalApiDto);
    }

    @Delete(':id')
    @ApiNoContentResponse()
    @HttpCode(204)
    async remove(@Param('id') id: string) {
        await this.externalApiService.remove(id);
    }
}
