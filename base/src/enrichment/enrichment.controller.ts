import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  Req,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { EnrichmentService } from './enrichment.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from 'src/auth/roles.decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { SYSTEM_CONST } from 'src/common/constants/system.constants';
import { EnrichmentProviderName } from 'src/common/enums/enums';
import { ZautoRequest } from 'src/common/models/request.model';
import { ContactEnrichmentDto } from './dto/contact-enrich.dto';

@ApiTags('enrichment')
@Roles(SYSTEM_CONST.ADMIN_ROLE, SYSTEM_CONST.SUPERUSER_ROLE)
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@Controller('enrichment')
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
    @Req() request: ZautoRequest,
  ) {
    const orgId = request.user.org.id;
    if (!orgId) {
      throw new UnauthorizedException('Org Id not found');
    }
    const params = {
      firstName,
      lastName,
      email,
      phoneNumber,
      domain,
      linkedin_url,
      provider,
    };
    return await this.enrichmentService.enrichPeople(orgId, params);
  }

  @Get('/organization')
  @ApiOperation({
    summary: 'Get organization information',
    description:
      'Retrieve information about organizations based on provided query parameters.',
  })
  @ApiQuery({
    name: 'domain',
    required: false,
    description: 'Domain associated with the organization',
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
    @Req() request: ZautoRequest,
  ) {
    const orgId = request.user.org.id;
    if (!orgId) {
      throw new UnauthorizedException('Org Id not found');
    }
    const params = {
      domain,
      provider,
    };
    return await this.enrichmentService.enrichOrganization(orgId, params);
  }

  @Post('/contact')
  async getContact(
    @Body() contactEnrichmentDto: ContactEnrichmentDto,
    @Req() req: ZautoRequest,
  ) {
    const orgId = req.user.org.id;
    if (!orgId) {
      throw new UnauthorizedException('Org Id not found');
    }
    return await this.enrichmentService.enrichContact(
      orgId,
      contactEnrichmentDto,
    );
  }
}
