import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, HttpCode, BadRequestException, Req, UnauthorizedException, NotAcceptableException } from '@nestjs/common';
import { SiteService } from './site.service';
import { CreateSiteDto } from './dto/create-site.dto';
import { UpdateSiteDto } from './dto/update-site.dto';
import { ApiBearerAuth, ApiBody, ApiCreatedResponse, ApiNoContentResponse, ApiOkResponse, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ResponseDTO } from 'src/common/dto/response.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { Site } from './entities/site.entity';
import { ScrapLinksDto, ScrapMultipleDto } from './dto/scrap-liks.dto';
import { WebScraperService } from 'src/common/services/web-scraper.service';
import { ZautoRequest } from 'src/common/models/request.model';
import { Roles } from 'src/auth/roles.decorator';
import { SYSTEM_CONST } from 'src/common/constants/system.constants';
import { RolesGuard } from 'src/auth/roles.guard';
import { SelectGreetingDto } from './dto/select-greeting.dto';



@ApiTags('Sites')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('api/sites')
export class SiteController {
  constructor(private readonly siteService: SiteService,
    private readonly websraperService: WebScraperService) { }

  @Post()
  @ApiBody({ type: CreateSiteDto })
  @ApiCreatedResponse({ type: Site })
  create(@Body() createSiteDto: CreateSiteDto, @Req() request: ZautoRequest) {
    const orgId = request.user.orgId;

    return this.siteService.create({ orgId, data: createSiteDto });
  }

  // @Get()
  // @ApiQuery({ name: 'page', description: 'Page number.', required: false })
  // @ApiQuery({ name: 'limit', description: 'Number of records in a page.', required: false })
  // @ApiOkResponse({
  //   type: ResponseDTO<Site>
  // })
  // async findAll(@Query() paginationDto: PaginationDto) {
  //   return await this.siteService.findAll(paginationDto);
  // }


  @Get()
  @ApiQuery({ name: 'page', description: 'Page number.', required: false })
  @ApiQuery({ name: 'limit', description: 'Number of records in a page.', required: false })
  @Roles(SYSTEM_CONST.ADMIN_ROLE, SYSTEM_CONST.SUPERUSER_ROLE)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOkResponse({
    type: ResponseDTO<Site>
  })
  async findAll(@Query() paginationDto: PaginationDto, @Req() zautoRequest: ZautoRequest) {

    if (zautoRequest.user && zautoRequest.user.orgId) {
      const orgId = zautoRequest.user.orgId;
      return await this.siteService.findAll({ orgId, data: paginationDto });
    }
    else {
      throw new UnauthorizedException("Unauthorised access.")
    }
  }

  @Get(':id')
  @ApiOkResponse({
    type: Site
  })
  async findOne(@Param('id') id: string, @Req() zautoRequest: ZautoRequest) {
    const orgId = zautoRequest.user.orgId;

    return await this.siteService.findOne({ orgId, data: { id } });
  }

  @Patch(':id')
  @ApiBody({ type: UpdateSiteDto })
  @ApiOkResponse({
    type: Site
  })
  async update(@Param('id') id: string, @Body() updateSiteDto: UpdateSiteDto, @Req() zautoRequest: ZautoRequest) {
    const orgId = zautoRequest.user.orgId;

    return await this.siteService.update({ orgId, data: updateSiteDto, id });
  }

  @Delete(':id')
  @ApiNoContentResponse()
  @HttpCode(204)
  async remove(@Param('id') id: string, @Req() zautoRequest: ZautoRequest) {
    const orgId = zautoRequest.user.orgId;
    return await this.siteService.remove({ orgId, data: { id } });
  }

  @Post("links")
  @ApiBody({ type: ScrapLinksDto })
  @ApiCreatedResponse({ type: ScrapLinksDto })
  async fetchURLs(@Body() scrapLinksDto: ScrapLinksDto) {
    if (this.isValidUrl(scrapLinksDto.rootUrl)) {
      const links = await this.siteService.getLinks(scrapLinksDto.rootUrl);
      return {
        links: links,
        count: links.length
      }
    }
    else throw new BadRequestException("Invalid URL.")
  }

  @Post("process")
  @ApiBody({ type: ScrapMultipleDto })
  @ApiCreatedResponse()
  async processURLs(@Body() scrapMultipleDto: ScrapMultipleDto, @Req() zautoRequest: ZautoRequest) {
    const orgId = zautoRequest.user.orgId;
    return await this.siteService.trainAvatar({ orgId, data: scrapMultipleDto });
  }

  isValidUrl(url: string) {
    try {
      new URL(url);
      return true;
    } catch (_) {
      return false;
    }
  }

  @Post('generate')
  @ApiOkResponse()
  async generatePageGreeting(@Req() req: ZautoRequest) {
    if (req.user && req.user.orgId) {
      return await this.siteService.generateGreeting(req.user.orgId);
    }
    else {
      throw new UnauthorizedException("Unauthorised access.");
    }
  }

  @Post('select')
  @ApiOkResponse()
  async selectGeneratedGreetings(@Body() selectGreetingDto: SelectGreetingDto[], @Req() req: ZautoRequest) {
    if (req.user && req.user.orgId) {
      return await this.siteService.selectGeneratedGreetings({ orgId: req.user.orgId, data: selectGreetingDto });
    }
    else {
      throw new UnauthorizedException("Unauthorised access.");
    }
  }
}
