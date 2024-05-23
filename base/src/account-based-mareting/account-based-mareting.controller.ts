import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, Req, UnauthorizedException } from '@nestjs/common';
import { AccountBasedMaretingService } from './account-based-mareting.service';
import { CreateAccountBasedMaretingDto } from './dto/create-account-based-mareting.dto';
import { UpdateAccountBasedMaretingDto } from './dto/update-account-based-mareting.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { FilterDto } from 'src/common/dto/filter.dto';
import { ZautoRequest } from 'src/common/models/request.model';

@ApiTags('Account Based Mareting')
@Controller('account-based-mareting')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AccountBasedMaretingController {
  constructor(private readonly accountBasedMaretingService: AccountBasedMaretingService) { }

  @Post()
  async create(@Body() createAccountBasedMaretingDto: CreateAccountBasedMaretingDto, @Req() request: ZautoRequest) {
    const orgId = request.user.orgId;
    if (!orgId) throw new UnauthorizedException();
    return await this.accountBasedMaretingService.create(orgId, createAccountBasedMaretingDto);
  }

  @Get()
  async findAll(@Query() filterDto: FilterDto, @Req() request: ZautoRequest) {
    const orgId = request.user.orgId;
    if (!orgId) throw new UnauthorizedException();
    return await this.accountBasedMaretingService.findAll(orgId, filterDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() request: ZautoRequest) {
    const orgId = request.user.orgId;
    if (!orgId) throw new UnauthorizedException();
    return await this.accountBasedMaretingService.findOne(orgId, id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Req() request: ZautoRequest, @Body() updateAccountBasedMaretingDto: UpdateAccountBasedMaretingDto) {
    const orgId = request.user.orgId;
    if (!orgId) throw new UnauthorizedException();
    return await this.accountBasedMaretingService.update(orgId, id, updateAccountBasedMaretingDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() request: ZautoRequest) {
    const orgId = request.user.orgId;
    if (!orgId) throw new UnauthorizedException();
    return await this.accountBasedMaretingService.remove(orgId, id);
  }
}
