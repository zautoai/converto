import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  Param,
  Patch, 
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { IRequest } from 'src/common/model/request.model';
import { CreateContactDto } from 'src/contacts/dto/create-contacts.dto';
import { CreateFormBuilderDto } from './dto/create-form-builder.dto';
import { UpdateFormBuilderDto } from './dto/update-form-builder.dto';
import { FormBuilderService } from './form-builder.service';

@ApiTags('Form Builder')
@Controller('form-builder')
export class FormBuilderController {
  constructor(private readonly formBuilderService: FormBuilderService) {}

  @ApiOperation({
    summary: 'Create form builder',
    description: 'Endpoint to create form builder.',
  })
  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async create(
    @Req() request: IRequest,
    @Body() createFormBuilderDto: CreateFormBuilderDto,
  ) {
    if (request.orgId) {
      return await this.formBuilderService.create(
        request.orgId,
        createFormBuilderDto,
      );
    } else {
      throw new UnauthorizedException('Unauthorized access');
    }
  }

  @ApiOperation({
    summary: 'Get form builders',
    description: 'Endpoint to get form builders.',
  })
  @Get()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async findAll(@Req() request: IRequest) {
    if (request.orgId) {
      return await this.formBuilderService.findAll(request.orgId);
    } else {
      throw new UnauthorizedException('Unauthorized access');
    }
  }

  @ApiOperation({
    summary: 'Get a single form builder',
    description: 'Endpoint to get a single form builder.',
  })
  @Get(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async findOne(@Req() request: IRequest, @Param('id') id: string) {
    if (request.orgId) {
      return await this.formBuilderService.findOne(request.orgId, id);
    } else {
      throw new UnauthorizedException('Unauthorized access');
    }
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async update(
    @Req() request: IRequest,
    @Param('id') id: string,
    @Body() updateFormBuilderDto: UpdateFormBuilderDto,
  ) {
    if (request.orgId) {
      return await this.formBuilderService.update(
        request.orgId,
        id,
        updateFormBuilderDto,
      );
    } else {
      throw new UnauthorizedException('Unauthorized access');
    }
  }

  @ApiOperation({
    summary: 'Delete a form builder',
    description: 'Endpoint to delete a form builder.',
  })
  @Delete(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async remove(@Req() request: IRequest, @Param('id') id: string) {
    if (request.orgId) {
      return await this.formBuilderService.remove(request.orgId, id);
    } else {
      throw new UnauthorizedException('Unauthorized access');
    }
  }

  @Get(':orgId/form/script/:id')
  @ApiOperation({
    summary: 'Get form script by id',
    description: 'Get form script by id',
  })
  @Header('Content-Type', 'application/javascript')
  async findFormScript(@Param('orgId') orgId: string, @Param('id') id: string) {
    return await this.formBuilderService.generateFormScript(orgId, id);
  }

  @Get(':orgId/form/html/:id')
  @ApiOperation({
    summary: 'Get form html by id',
    description: 'Get form html by id',
  })
  @Header('Content-Type', 'application/text')
  async findFormHtml(@Param('orgId') orgId: string, @Param('id') id: string) {
    return await this.formBuilderService.generateFormHTML(orgId, id);
  }

  @Post(':orgId/form/submit/:id')
  @ApiOperation({
    summary: 'Get form submit by id',
    description: 'Get form submit by id',
  })
  async findFormSubmit(
    @Param('orgId') orgId: string,
    @Param('id') id: string,
    @Body() formData: any,
  ) {
    return await this.formBuilderService.submitForm(orgId, id, formData);
  }
}
