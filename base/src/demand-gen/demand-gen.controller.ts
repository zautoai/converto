import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DemandGenService } from './demand-gen.service';
import { CreateDemandGenDto } from './dto/create-demand-gen.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Demand Gen')
@Controller('api/demand-gen')
export class DemandGenController {
  constructor(private readonly demandGenService: DemandGenService) {}

  @Post()
  async find(@Body() createDemandGenDto: CreateDemandGenDto) {
    return await this.demandGenService.create(createDemandGenDto);
  }

}
