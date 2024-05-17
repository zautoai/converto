import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common';

import { ApiBearerAuth, ApiOkResponse, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/auth/roles.decorator';
import { SYSTEM_CONST } from 'src/common/constants/system.constants';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { ResponseDTO } from 'src/common/dto/response.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { LeadCategoryService } from './lead-category.service';
import { CreateLeadCategoryDto } from './dto/create-platform.dto';
import { LeadCategory } from './entities/platform.entity';
import { ZautoRequest } from 'src/common/models/request.model';

@ApiTags('LeadCategory')
@Roles(SYSTEM_CONST.ADMIN_ROLE, SYSTEM_CONST.SUPERUSER_ROLE)
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@Controller('api/lead-categories')
export class LeadCategoryController {

    constructor(private readonly leadCategoryService: LeadCategoryService) {}

    @Post()
    async create(@Body() createLeadCategoryDto: CreateLeadCategoryDto, @Req() zautoRequest: ZautoRequest)
    {
        return await this.leadCategoryService.create(createLeadCategoryDto, zautoRequest);
    }


    @Get()
    @ApiQuery({ name: 'page', description: 'Page number.', required: false })
    @ApiQuery({ name: 'limit', description: 'Number of records in a page.', required: false })
    @Roles(SYSTEM_CONST.ADMIN_ROLE, SYSTEM_CONST.SUPERUSER_ROLE)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiBearerAuth()
    @ApiOkResponse({
      type: ResponseDTO<LeadCategory>
    })
    async findAllLeadCategories(@Query() paginationDto: PaginationDto,@Req() zautoRequest: ZautoRequest)
    {
        if(zautoRequest.user && zautoRequest.orgId)
        {
            const orgId = zautoRequest.orgId;
            return await this.leadCategoryService.findAllByOrg(orgId,paginationDto);
        }
        else
        {
            throw new UnauthorizedException("Unauthorised access.")
        }
    }

    @Get(':id')
    @ApiOkResponse({type:LeadCategory})
    async findOne(@Param('id') id:string)
    {
        return await this.leadCategoryService.findOne(id);
    }

    @Patch(':id')
    @ApiOkResponse({type:LeadCategory})
    async update(@Param('id') id: string, @Body() updateLeadConfigDto: CreateLeadCategoryDto)
    {
        return await this.leadCategoryService.update(id,updateLeadConfigDto);
    }

    @Delete(':id')
    @HttpCode(204)
    async delete(@Param('id') id: string)
    {
        return await this.leadCategoryService.delete(id);
    }
}
