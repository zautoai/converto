import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Patch } from '@nestjs/common';
import { ExternalToolService } from './external-tool.service';
import { CreateToolDto } from './Dto/create-tool.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from 'src/auth/roles.decorator';
import { SYSTEM_CONST } from 'src/common/constants/system.constants';


@ApiTags('External tool')
@Controller('api/external-tool')
@UseGuards(JwtAuthGuard)
@Roles(SYSTEM_CONST.ADMIN_ROLE)
@ApiBearerAuth()
export class ExternalToolController {

    constructor(private readonly toolService: ExternalToolService) {}

    @Post()
    async create(@Body() createToolDto: CreateToolDto) {
        return this.toolService.create(createToolDto);
    }

    @Get()
    async findAll() {
        return this.toolService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.toolService.findOne(id);
    }

    @Get('name/:name')
    async getToolByName(@Param('name') name: string) {
        return this.toolService.getToolByName(name);
    }

    @Patch(':id')
    async update(@Param('id') id: string, @Body() createToolDto: CreateToolDto) {
        return this.toolService.update(id, createToolDto);
    }

    @Delete(':id')
    async remove(@Param('id') id: string) {
        return this.toolService.remove(id);
    }
}
