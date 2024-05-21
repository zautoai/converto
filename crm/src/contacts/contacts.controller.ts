import {
  BadRequestException,
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
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FilterDto } from 'src/common/dtos/filter.dto';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { IRequest } from 'src/common/model/request.model';
import { CreateFieldDto } from 'src/custom-fields/dto/create-fields.dto';
import { ContactsService } from './contacts.service';
import { CreateContactDto } from './dto/create-contacts.dto';
import { UpdateContactDto } from './dto/update-contact.dto';

@ApiTags('Contacts')
@Controller('contacts')
export class ContactsController {
  constructor(private contactsService: ContactsService) { }

  @ApiOperation({
    summary: 'Get all contacts for an organization',
    description: 'Endpoint to get all contacts for an organization.',
  })
  @Get()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async getContacts(@Query() filterDto: FilterDto, @Req() request: IRequest) {
    if (request.orgId) {
      return this.contactsService.getContacts(request.orgId, filterDto);
    } else {
      throw new UnauthorizedException('Unauthorized access');
    }
  }

  @Get('fields')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async getFields(@Req() request: IRequest) {
    if (request.orgId) {
      return this.contactsService.getContactFields(request.orgId);
    } else {
      throw new UnauthorizedException('Unauthorized access');
    }
  }

  @ApiOperation({
    summary: 'Get all contacts for a conversation',
    description: 'Endpoint to get all contacts for a conversation.',
  })
  @Get('conversation/:id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async getContactsByConversation(@Req() request: IRequest, @Param('id') id: string) {
    if (request.orgId) {
      return this.contactsService.getContactsByConversation(request.orgId, id);
    } else {
      throw new UnauthorizedException('Unauthorized access');
    }
  }

  @ApiOperation({
    summary: 'Get all contacts for a date range',
    description: 'Endpoint to get all contacts for a date range.',
  })
  @Get('date-range')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async getContactsByDateRange(@Req() request: IRequest, @Query('startDate') startDate: Date, @Query('endDate') endDate: Date) {
    if (request.orgId) {
      return this.contactsService.getContactsByDate(request.orgId, startDate, endDate);
    } else {
      throw new UnauthorizedException('Unauthorized access');
    }
  }


  @ApiOperation({
    summary: 'Get a single contact for an organization',
    description: 'Endpoint to get a single contact for an organization.',
  })
  @Get(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async getContact(@Req() request: IRequest, @Param('id') id: string) {
    if (request.orgId) {
      return this.contactsService.getContactFields(request.orgId);
    } else {
      throw new UnauthorizedException('Unauthorized access');
    }
  }

  @ApiOperation({
    summary: 'Create a contact for an organization',
    description: 'Endpoint to create a contact for an organization.',
  })
  @ApiBody({ type: CreateContactDto })
  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async createContact(@Req() request: IRequest, @Body() createContactDto: any) {
    if (request.orgId) {
      try {
        const _createContactDto: CreateContactDto = new CreateContactDto(
          createContactDto,
        );
        await _createContactDto.validate();

        return await this.contactsService.createContact(
          request.orgId,
          createContactDto,
        );
      } catch (error) {
        console.log(error);

        throw new BadRequestException(error.message);
      }
    } else {
      throw new UnauthorizedException('Unauthorized access');
    }
  }

  @ApiOperation({
    summary: 'Update a contact for an organization',
    description: 'Endpoint to update a contact for an organization.',
  })
  @ApiBody({ type: UpdateContactDto })
  @Patch(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async updateContact(
    @Req() request: IRequest,
    @Param('id') id: string,
    @Body() updateContactDto: any,
  ) {
    if (request.orgId) {
      return this.contactsService.updateContact(
        request.orgId,
        id,
        updateContactDto,
      );
    } else {
      throw new UnauthorizedException('Unauthorized access');
    }
  }

  @ApiOperation({
    summary: 'Delete a contact for an organization',
    description: 'Endpoint to delete a contact for an organization.',
  })
  @Delete(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async deleteContact(@Req() request: IRequest, @Param('id') id: string) {
    if (request.orgId) {
      return this.contactsService.deleteContact(request.orgId, id);
    } else {
      throw new UnauthorizedException('Unauthorized access');
    }
  }

  @ApiOperation({
    summary: 'Create custom field in contact for an organization',
    description:
      'Endpoint to create custom field in contact for an organization.',
  })
  @Post('customfield')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async createCustomField(
    @Req() request: IRequest,
    @Body() createFieldDto: CreateFieldDto,
  ) {
    return this.contactsService.createCustomField(
      request.orgId,
      createFieldDto,
    );
  }


}
