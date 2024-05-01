import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { EnrichmentService } from './enrichment.service';
import {
  ApiQuery,
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { EnrichmentProviderName } from './enrichment-provider.enum';
import { ContactEnrichmentDto } from './dto/contact-enrich.dto';
import { IRequest } from 'src/common/model/request.model';

@ApiTags('Enrichment')
@Controller('enrichment')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class EnrichmentController {
  constructor(private readonly enrichmentService: EnrichmentService) {}

  @Get('/people')
  @ApiOperation({
    summary: 'Get people information',
    description:
      'Retrieve information about people based on provided query parameters.',
  })
  @ApiQuery({
    name: 'firstName',
    required: false,
    description: 'First name of the person',
  })
  @ApiQuery({
    name: 'lastName',
    required: false,
    description: 'Last name of the person',
  })
  @ApiQuery({
    name: 'email',
    required: false,
    description: 'Email address of the person',
  })
  @ApiQuery({
    name: 'phone_number',
    required: false,
    description: 'Phone number of the person',
  })
  @ApiQuery({
    name: 'domain',
    required: false,
    description: 'Domain associated with the person',
  })
  @ApiQuery({
    name: 'linkedin_url',
    required: false,
    description: 'LinkedIn URL of the person',
  })
  @ApiQuery({
    name: 'provider',
    required: false,
    description: 'Provider used to retrieve the information',
    enum: EnrichmentProviderName,
  })
  async getPeople(
    @Query('firstName') firstName: string,
    @Query('lastName') lastName: string,
    @Query('email') email: string,
    @Query('phone_number') phoneNumber: string,
    @Query('domain') domain: string,
    @Query('linkedin_url') linkedin_url: string,
    @Query('provider') provider: string,
  ) {
    provider = provider ? provider : EnrichmentProviderName.APOLLO;
    if (firstName || lastName) {
      return await this.enrichmentService.getPeopleByName(
        firstName,
        lastName,
        provider,
      );
    } else if (email) {
      return await this.enrichmentService.getPeopleByEmail(email, provider);
    } else if (phoneNumber) {
      return await this.enrichmentService.getPeopleByPhone(
        phoneNumber,
        provider,
      );
    } else if (domain) {
      return await this.enrichmentService.getPeopleByDomain(domain, provider);
    } 
    else if (linkedin_url) {
      return await this.enrichmentService.getPeople({linkedin_url},provider);
    }
    else {
      throw new BadRequestException('Invalid query parameters');
    }
  }

  @Get('/organization')
  @ApiOperation({
    summary: 'Get organization information',
    description:
      'Retrieve information about organizations based on provided query parameters.',
  })
  @ApiQuery({
    name: 'name',
    required: false,
    description: 'Name of the organization',
  })
  @ApiQuery({
    name: 'domain',
    required: false,
    description: 'Domain associated with the organization',
  })
  @ApiQuery({
    name: 'email',
    required: false,
    description: 'Email address associated with the organization',
  })
  @ApiQuery({
    name: 'phone_number',
    required: false,
    description: 'Phone number associated with the organization',
  })
  @ApiQuery({
    name: 'provider',
    required: false,
    description: 'Provider used to retrieve the information',
    enum: EnrichmentProviderName,
  })
  async getOrganization(
    @Query('domain') domain: string,
    @Query('provider') provider: string,
  ) {
    provider = provider ? provider : EnrichmentProviderName.APOLLO;
    if (domain) {
      return await this.enrichmentService.getOrganizationByDomain(
        domain,
        provider,
      );
    } else {
      throw new BadRequestException('Invalid query parameters');
    }
  }

  @Post('/contact')
  async getContact(
    @Body() contactEnrichmentDto: ContactEnrichmentDto,
    @Req() req: IRequest,
  ) {
    const orgId = req.orgId;
    if (orgId) {
      const provided = contactEnrichmentDto.provider
        ? contactEnrichmentDto.provider
        : EnrichmentProviderName.APOLLO;
      return await this.enrichmentService.enrichContact(
        orgId,
        contactEnrichmentDto.contactId,
        provided,
      );
    }
    throw new UnauthorizedException();
  }
}
