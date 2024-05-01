import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { HelpersService } from './helpers.service';
import { CreateHelperDto } from './dto/create-helper.dto';
import { UpdateHelperDto } from './dto/update-helper.dto';

@Controller('helpers')
export class HelpersController {
  constructor(private readonly helpersService: HelpersService) {}

  @Post()
  create(@Body() createHelperDto: CreateHelperDto) {
    return this.helpersService.create(createHelperDto);
  }

  @Get()
  findAll() {
    return this.helpersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.helpersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateHelperDto: UpdateHelperDto) {
    return this.helpersService.update(+id, updateHelperDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.helpersService.removeById(id);
  }
}
