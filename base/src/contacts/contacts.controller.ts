import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, UnauthorizedException, Query } from '@nestjs/common';
import { ContactsService } from './contacts.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/auth/roles.decorator';
import { SYSTEM_CONST } from 'src/common/constants/system.constants';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { ZautoRequest } from 'src/common/models/request.model';
import { FilterDto } from 'src/common/dto/filter.dto';

@ApiTags('contacts')
@Roles(SYSTEM_CONST.ADMIN_ROLE, SYSTEM_CONST.SUPERUSER_ROLE)
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@Controller('contacts')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Post()
  async create(@Body() createContactDto: CreateContactDto,@Req() request: ZautoRequest) {
    const orgId = request.user.org.id;
    if(!orgId)
    {
      throw new UnauthorizedException('Org Id not found');
    }
    return await this.contactsService.create(orgId,createContactDto);
  }

  @Get()
  async findAll(@Query() filterDto:FilterDto,@Req() request: ZautoRequest) {
    const orgId = request.user.org.id;
    if(!orgId)
    {
      throw new UnauthorizedException('Org Id not found');
    }
    return await this.contactsService.findAll(orgId,filterDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string,@Req() request: ZautoRequest) {
    const orgId = request.user.org.id;
    if(!orgId)
    {
      throw new UnauthorizedException('Org Id not found');
    }
    return await this.contactsService.findOne(orgId,id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateContactDto: UpdateContactDto,@Req() request: ZautoRequest) {
    const orgId = request.user.org.id;
    if(!orgId)
    {
      throw new UnauthorizedException('Org Id not found');
    }
    return await this.contactsService.update(orgId,id, updateContactDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string,@Req() request: ZautoRequest) {
    const orgId = request.user.org.id;
    if(!orgId)
    {
      throw new UnauthorizedException('Org Id not found');
    }
    return await this.contactsService.remove(orgId,id);
  }
}
