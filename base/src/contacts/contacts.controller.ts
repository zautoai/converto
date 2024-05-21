import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import { SYSTEM_CONST } from 'src/common/constants/system.constants';
import { FilterDto } from 'src/common/dto/filter.dto';
import { ZautoRequest } from 'src/common/models/request.model';
import { ContactsService } from './contacts.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { CreateFieldDto } from './dto/create-field.dto';

@ApiTags('contacts')
@Roles(SYSTEM_CONST.ADMIN_ROLE, SYSTEM_CONST.SUPERUSER_ROLE)
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@Controller('api/contacts')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) { }

  @ApiBody({ type: CreateContactDto })
  @Post()
  async create(@Body() createContactDto: any, @Req() request: ZautoRequest) {
    const orgId = request.orgId;
    if (!orgId) {
      throw new UnauthorizedException('Org Id not found');
    }
    return await this.contactsService.create(orgId, createContactDto);
  }

  @Get()
  async findAll(@Query() filterDto: FilterDto, @Req() request: ZautoRequest) {
    const orgId = request.orgId;
    if (!orgId) {
      throw new UnauthorizedException('Org Id not found');
    }
    return await this.contactsService.findAll(orgId, filterDto);
  }

  @Get('fields')
  async getFields(@Req() request: ZautoRequest) {
    const orgId = request.orgId;
    if (!orgId) {
      throw new UnauthorizedException('Org Id not found');
    }
    return await this.contactsService.getContactFields(orgId);
  }


  @Get('conversation/:id')
  async getContactsByConversation(@Req() request: ZautoRequest, @Param('id') id: string) {
    const orgId = request.orgId;
    if (!orgId) {
      throw new UnauthorizedException('Org Id not found');
    }
    return await this.contactsService.getContactsByConversation(orgId, id);
  }

  @Get('date-range')
  async getContactsByDateRange(@Req() request: ZautoRequest, @Query('startDate') startDate: Date, @Query('endDate') endDate: Date) {
    const orgId = request.orgId;
    if (!orgId) {
      throw new UnauthorizedException('Org Id not found');
    }
    if (startDate && endDate) {
      return await this.contactsService.getContactsByDate(orgId, startDate, endDate);
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() request: ZautoRequest) {
    const orgId = request.orgId;
    if (!orgId) {
      throw new UnauthorizedException('Org Id not found');
    }
    return await this.contactsService.findOne(orgId, id);
  }

  @ApiBody({ type: UpdateContactDto })
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateContactDto: any,
    @Req() request: ZautoRequest,
  ) {
    const orgId = request.orgId;
    if (!orgId) {
      throw new UnauthorizedException('Org Id not found');
    }
    return await this.contactsService.update(orgId, id, updateContactDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() request: ZautoRequest) {
    const orgId = request.orgId;
    if (!orgId) {
      throw new UnauthorizedException('Org Id not found');
    }
    return await this.contactsService.remove(orgId, id);
  }

  @Post('customfield')
  async createCustomField(@Body() createFieldDto: CreateFieldDto, @Req() request: ZautoRequest) {
    const orgId = request.orgId;
    if (!orgId) {
      throw new UnauthorizedException('Org Id not found');
    }
    return await this.contactsService.createCustomFields(orgId, createFieldDto);
  }

}
