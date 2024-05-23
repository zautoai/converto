import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Put, Query, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { OrgSmtpconfigService } from './org-smtpconfig.service';
import { ApiBearerAuth, ApiCreatedResponse, ApiNoContentResponse, ApiOkResponse, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/auth/roles.decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { SYSTEM_CONST } from 'src/common/constants/system.constants';
import { ZautoRequest } from 'src/common/models/request.model';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { CreateOrgSmtpconfigDto } from './dto/create-org-smtpconfig.dto';
import { UpdateOrgSmtpconfigDto } from './dto/update-org-smtpconfig.dto';

@ApiTags('Org SMTP Config')
@Roles(SYSTEM_CONST.ADMIN_ROLE, SYSTEM_CONST.SUPERUSER_ROLE)
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@Controller('api/organization/smtpconfig')
export class OrgSmtpconfigController {
    constructor(
        private readonly orgSmtpconfigService: OrgSmtpconfigService
    ) { }


    @Get()
    @ApiQuery({ name: 'page', description: 'Page number.', required: false })
    @ApiQuery({ name: 'limit', description: 'Number of records in a page.', required: false })
    @Roles(SYSTEM_CONST.ADMIN_ROLE, SYSTEM_CONST.SUPERUSER_ROLE)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiBearerAuth()
    @ApiOkResponse()
    async findAll(@Query() paginationDto: PaginationDto, @Req() request: ZautoRequest) {
        if (request.user && request.user.orgId) {
            const orgId = request.user.orgId;
            return await this.orgSmtpconfigService.findAll({orgId,data:paginationDto});
        }
        else {
            throw new UnauthorizedException("Unauthorised access.")
        }
    }

    @Get(':id')
    @Roles(SYSTEM_CONST.ADMIN_ROLE, SYSTEM_CONST.SUPERUSER_ROLE)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiBearerAuth()
    @ApiOkResponse()
    async findOne(@Param('id') id: string, @Req() request: ZautoRequest) {
        if (request.user && request.user.orgId) {
            const orgId = request.user.orgId;
            const data = await this.orgSmtpconfigService.findOne(orgId,id);
            delete data.pass;
            return data;
        }
        else {
            throw new UnauthorizedException("Unauthorised access.")
        }

    }

    @Post()
    @Roles(SYSTEM_CONST.ADMIN_ROLE, SYSTEM_CONST.SUPERUSER_ROLE)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiBearerAuth()
    @ApiCreatedResponse()
    async create(@Body() createOrgSmtpconfigDto: CreateOrgSmtpconfigDto, @Req() request: ZautoRequest) {
        if (request.user && request.user.orgId) {
            const orgId = request.user.orgId;
            return await this.orgSmtpconfigService.create({orgId,data:createOrgSmtpconfigDto});
        }
        else {
            throw new UnauthorizedException("Unauthorised access.") 
        }
    }

    @Patch(':id')
    @Roles(SYSTEM_CONST.ADMIN_ROLE, SYSTEM_CONST.SUPERUSER_ROLE)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiBearerAuth()
    @ApiOkResponse()
    async update(@Param('id') id: string, @Body() updateOrgSmtpconfigDto: UpdateOrgSmtpconfigDto, @Req() request: ZautoRequest) {
        if (request.user && request.user.orgId) {
            const orgId = request.user.orgId;
            return await this.orgSmtpconfigService.update({orgId,data:{id, updateOrgSmtpconfigDto}});
        }
        else {
            throw new UnauthorizedException("Unauthorised access.")
        }
    }

    @Delete(':id')
    @Roles(SYSTEM_CONST.ADMIN_ROLE, SYSTEM_CONST.SUPERUSER_ROLE)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiBearerAuth()
    @ApiNoContentResponse()
    @HttpCode(204)
    async delete(@Param('id') id: string, @Req() request: ZautoRequest) {
        if (request.user && request.user.orgId) {
            const orgId = request.user.orgId;
            return await this.orgSmtpconfigService.delete(orgId,id);
        }
        else {
            throw new UnauthorizedException("Unauthorised access.")
        }
    }

}
