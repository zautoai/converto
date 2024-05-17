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
import { UsageService } from 'src/account/usage.service';
import { SelectGreetingDto } from './dto/select-greeting.dto';



@ApiTags('Sites')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('api/sites')
export class SiteController {
  constructor(private readonly siteService: SiteService,
    private readonly websraperService: WebScraperService,
    private readonly usageService: UsageService) {}

  @Post()
  @ApiBody({ type: CreateSiteDto })
  @ApiCreatedResponse({type: Site})
  create(@Body() createSiteDto: CreateSiteDto) {
    return this.siteService.create(createSiteDto);
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
    async findAll(@Query() paginationDto: PaginationDto,@Req() zautoRequest: ZautoRequest)
    {
        if(zautoRequest.user && zautoRequest.orgId)
        {
            const orgId = zautoRequest.orgId;
            return await this.siteService.findAllByOrg(orgId,paginationDto);
        }
        else
        {
            throw new UnauthorizedException("Unauthorised access.")
        }
    }

  @Get(':id')
  @ApiOkResponse({
    type: Site
  })
  async findOne(@Param('id') id: string) {
    return await this.siteService.findOne(id);
  }

  @Patch(':id')
  @ApiBody({ type: UpdateSiteDto })
  @ApiOkResponse({
    type: Site
  })
  async update(@Param('id') id: string, @Body() updateSiteDto: UpdateSiteDto) {
    return await this.siteService.update(id, updateSiteDto);
  }

  @Delete(':id')
  @ApiNoContentResponse()
  @HttpCode(204)
  async remove(@Param('id') id: string) {
    return await this.siteService.remove(id);
  }

  @Post("links")
  @ApiBody({ type: ScrapLinksDto })
  @ApiCreatedResponse({type: ScrapLinksDto})
  async fetchURLs(@Body() scrapLinksDto: ScrapLinksDto) {
    if(this.isValidUrl(scrapLinksDto.rootUrl)) {
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
  async processURLs(@Body() scrapMultipleDto: ScrapMultipleDto,@Req() request: ZautoRequest) {
    const orgId = request.orgId;
    const siteUsage = await this.usageService.getSiteCount(orgId);
    const remainingSite = siteUsage.maxCount - siteUsage.count;
    if(remainingSite <= 0)
    {
      throw new NotAcceptableException(`Remaining site ${remainingSite}`)
    }
    return await this.siteService.trainAvatar(orgId,scrapMultipleDto);
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
  async generatePageGreeting(@Req() req: ZautoRequest)
  {
    if(req.user && req.orgId)
    {
        return await this.siteService.generateGreeting(req.orgId);
    }
    else
    {
        throw new UnauthorizedException("Unauthorised access.");
    }
  }

  @Post('select')
  @ApiOkResponse()
  async selectGeneratedGreetings(@Body() selectGreetingDto: SelectGreetingDto[],@Req() req: ZautoRequest)
  {
    if(req.user && req.orgId)
    {
        return await this.siteService.selectGeneratedGreetings(req.orgId,selectGreetingDto);
    }
    else
    {
        throw new UnauthorizedException("Unauthorised access.");
    }
  }
}
