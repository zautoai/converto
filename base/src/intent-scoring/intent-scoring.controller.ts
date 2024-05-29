import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { IntentScoringService } from './intent-scoring.service';
import { CreateIntentScoringDto } from './dto/create-intent-scoring.dto';
import { UpdateIntentScoringDto } from './dto/update-intent-scoring.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ZautoRequest } from 'src/common/models/request.model';

@ApiTags('Intent Scoring')
@Controller('api/intent-scoring')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class IntentScoringController {
  constructor(private readonly intentScoringService: IntentScoringService) {}

  @Post()
  async create(@Body() createIntentScoringDto: CreateIntentScoringDto, @Req() request: ZautoRequest) {
    const orgId = request.user.orgId;
    return await this.intentScoringService.create({orgId,data:createIntentScoringDto});
  }

  @Get()
  async findAll(@Req() request: ZautoRequest) { 
    const orgId = request.user.orgId;
    return await this.intentScoringService.findAll(orgId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() request: ZautoRequest) {
    const orgId = request.user.orgId;
    return await this.intentScoringService.findOne(orgId,id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateIntentScoringDto: UpdateIntentScoringDto, @Req() request: ZautoRequest) {
    const orgId = request.user.orgId;
    return await this.intentScoringService.update({orgId,data:{id, updateIntentScoringDto}});
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() request: ZautoRequest) {
    const orgId = request.user.orgId;
    return await this.intentScoringService.remove(orgId,id);
  }
}
