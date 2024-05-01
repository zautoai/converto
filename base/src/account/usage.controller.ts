import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ZautoRequest } from 'src/common/models/request.model';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import { SYSTEM_CONST } from 'src/common/constants/system.constants';
import { UsageService } from './usage.service';

@ApiTags('Accounts')
@Controller('api/account/usage/')
@Roles(SYSTEM_CONST.ADMIN_ROLE, SYSTEM_CONST.SUPERUSER_ROLE)
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UsageController {

    constructor(private usageService:UsageService){}

    @Get('')
    async getUsage(@Query() querys:{ date: string }, @Req() request: ZautoRequest) {
        if (request && request.user && request.user.org) {
            const orgId = request.user.org.id;
            return this.usageService.getUsage(orgId,querys.date);
        }
        else {
            throw new UnauthorizedException;
        }
    }

    @Get('sites')
    async getSiteCount(@Req() request: ZautoRequest) {
        if (request && request.user && request.user.org) {
            const orgId = request.user.org.id;
            return this.usageService.getSiteCount(orgId);
        }
        else {
            throw new UnauthorizedException;
        }
    }

    @Get('users')
    async getUserCount(@Req() request: ZautoRequest) {
        if (request && request.user && request.user.org) {
            const orgId = request.user.org.id;
            return this.usageService.getUserCount(orgId);
        }
        else {
            throw new UnauthorizedException;
        }
    }

    @Get('messages')
    async getMessageCount(@Query() querys:{ date: string }, @Req() request: ZautoRequest) {
        if (request && request.user && request.user.org) {
            const orgId = request.user.org.id;
            return this.usageService.getMessageCount(orgId,querys.date);
        }
        else {
            throw new UnauthorizedException;
        }
    }

    @Get('conversations')
    async getConversationCount(@Query() querys:{ date: string }, @Req() request: ZautoRequest) {
        if (request && request.user && request.user.org) {
            const orgId = request.user.org.id;
            return this.usageService.getConversationCount(orgId,querys.date);
        }
        else {
            throw new UnauthorizedException;
        }
    }

    @Get('campaigns')
    async getCampaignCount(@Query() querys:{ date: string }, @Req() request: ZautoRequest) {
        if (request && request.user && request.user.org) {
            const orgId = request.user.org.id;
            return this.usageService.getCampaginCount(orgId,querys.date);
        }
        else {
            throw new UnauthorizedException;
        }
    }
}
