import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, UnauthorizedException, Header } from '@nestjs/common';
import { FormBuilderService } from './form-builder.service';
import { CreateFormBuilderDto } from './dto/create-form-builder.dto';
import { UpdateFormBuilderDto } from './dto/update-form-builder.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { ZautoRequest } from 'src/common/models/request.model';

@ApiTags('form-builder')
@Controller('form-builder')
export class FormBuilderController {
  constructor(private readonly formBuilderService: FormBuilderService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  async create(@Body() createFormBuilderDto: CreateFormBuilderDto,@Req() request: ZautoRequest) {
    const orgId = request.user.org.id;
    if(!orgId) throw new UnauthorizedException('Organization not found');
    return await this.formBuilderService.create(orgId,createFormBuilderDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  async findAll(@Req() request: ZautoRequest) {
    const orgId = request.user.org.id;
    if(!orgId) throw new UnauthorizedException('Organization not found');
    return await this.formBuilderService.findAll(orgId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  async findOne(@Param('id') id: string,@Req() request: ZautoRequest) {
    const orgId = request.user.org.id;
    if(!orgId) throw new UnauthorizedException('Organization not found');
    return await this.formBuilderService.findOne(orgId,id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  async update(@Param('id') id: string, @Body() updateFormBuilderDto: UpdateFormBuilderDto,@Req() request: ZautoRequest) {
    const orgId = request.user.org.id;
    if(!orgId) throw new UnauthorizedException('Organization not found');
    return await this.formBuilderService.update(orgId,id, updateFormBuilderDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  async remove(@Param('id') id: string,@Req() request: ZautoRequest) {
    const orgId = request.user.org.id;
    if(!orgId) throw new UnauthorizedException('Organization not found');
    return await this.formBuilderService.remove(orgId,id);
  }

  @Get(':orgId/form/script/:id')
  @Header('Content-Type', 'application/javascript')
  async findFormScript(@Param('orgId') orgId: string, @Param('id') id: string) {
    return await this.formBuilderService.generateFormScript(orgId, id);
  }

  @Get(':orgId/form/html/:id')
  @Header('Content-Type', 'application/text')
  async findFormHtml(@Param('orgId') orgId: string, @Param('id') id: string) {
    return await this.formBuilderService.generateFormHTML(orgId, id);
  }

  @Post(':orgId/form/submit/:id')
  async findFormSubmit(
    @Param('orgId') orgId: string,
    @Param('id') id: string,
    @Body() formData: any,
  ) {
    return await this.formBuilderService.submitForm(orgId, id, formData);
  }
}
