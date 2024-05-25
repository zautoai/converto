import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { ProspectJurnyService } from './prospect-jurny.service';
import { CreateProspectJurnyDto } from './dto/create-prospect-jurny.dto';
import { UpdateProspectJurnyDto } from './dto/update-prospect-jurny.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SubdomainGuard } from 'src/common/guard/subdomain/subdomain.guard';
import { SubdomainRequest } from 'src/common/models/subdomain-request.model';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ZautoRequest } from 'src/common/models/request.model';

@ApiTags('Prospect Jurny')
@Controller('prospect-jurny')
export class ProspectJurnyController {
  constructor(private readonly prospectJurnyService: ProspectJurnyService) {}

  @Post()
  @UseGuards(SubdomainGuard)
  @ApiBearerAuth("x-tenant-id")
  create(@Body() createProspectJurnyDto: CreateProspectJurnyDto, @Req() request: SubdomainRequest) {
    const orgId = request.orgId;
    return this.prospectJurnyService.create({orgId,data: createProspectJurnyDto});
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  findAll(@Req() request: ZautoRequest) {
    const orgId = request.user.orgId;
    return this.prospectJurnyService.findAll(orgId);
  }
  
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  findOne(@Param('id') id: string, @Req() request: ZautoRequest) {
    const orgId = request.user.orgId;
    return this.prospectJurnyService.findOne(orgId,id);
  }
  
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  update(@Param('id') id: string, @Body() updateProspectJurnyDto: UpdateProspectJurnyDto, @Req() request: ZautoRequest) {
    const orgId = request.user.orgId;
    return this.prospectJurnyService.update({orgId,data:{id, updateProspectJurnyDto}});
  }
  
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  remove(@Param('id') id: string, @Req() request: ZautoRequest) {
    const orgId = request.user.orgId;
    return this.prospectJurnyService.remove(orgId,id);
  }
}
