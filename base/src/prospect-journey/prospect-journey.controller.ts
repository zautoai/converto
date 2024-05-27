import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { ProspectjourneyService } from './prospect-journey.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SubdomainGuard } from 'src/common/guard/subdomain/subdomain.guard';
import { SubdomainRequest } from 'src/common/models/subdomain-request.model';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ZautoRequest } from 'src/common/models/request.model';
import { CreateProspectjourneyDto } from './dto/create-prospect-journey.dto';
import { UpdateProspectjourneyDto } from './dto/update-prospect-journey.dto';

@ApiTags('Prospect journey')
@Controller('prospect-journey')
export class ProspectjourneyController {
  constructor(private readonly prospectjourneyService: ProspectjourneyService) {}

  @Post()
  @UseGuards(SubdomainGuard)
  @ApiBearerAuth("x-tenant-id")
  create(@Body() createProspectjourneyDto: CreateProspectjourneyDto, @Req() request: SubdomainRequest) {
    const orgId = request.orgId;
    return this.prospectjourneyService.create({orgId,data: createProspectjourneyDto});
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  findAll(@Req() request: ZautoRequest) {
    const orgId = request.user.orgId;
    return this.prospectjourneyService.findAll(orgId);
  }
  
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  findOne(@Param('id') id: string, @Req() request: ZautoRequest) {
    const orgId = request.user.orgId;
    return this.prospectjourneyService.findOne(orgId,id);
  }
  
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  update(@Param('id') id: string, @Body() updateProspectjourneyDto: UpdateProspectjourneyDto, @Req() request: ZautoRequest) {
    const orgId = request.user.orgId;
    return this.prospectjourneyService.update({orgId,data:{id, updateProspectjourneyDto}});
  }
  
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  remove(@Param('id') id: string, @Req() request: ZautoRequest) {
    const orgId = request.user.orgId;
    return this.prospectjourneyService.remove(orgId,id);
  }
}
