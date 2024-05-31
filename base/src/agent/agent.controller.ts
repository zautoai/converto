import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, HttpCode, Req, Header, UnauthorizedException, UseInterceptors, HttpException, HttpStatus, UploadedFile, ConflictException, NotFoundException } from '@nestjs/common';
import { AgentService } from './agent.service';
import { UpdateAgentDto } from './dto/update-agent.dto';
import { Agent } from './entities/agent.entity';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { ApiBearerAuth, ApiBody, ApiCreatedResponse, ApiNoContentResponse, ApiOkResponse, ApiQuery, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { ResponseDTO } from 'src/common/dto/response.dto';
import { NameAvailability, NameCheckDto } from './dto/namecheck.dto';
import { SYSTEM_CONST } from 'src/common/constants/system.constants';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { extname } from 'path';
import { diskStorage } from 'multer';
import { ZautoRequest } from 'src/common/models/request.model';
import * as sharp from 'sharp';
import { Multer } from 'multer';
import { StaticFileService } from 'src/common/services/static.service';
import { VisitorService } from 'src/visitor/visitor.service';
import { CreateAvatarDto } from './dto/create-avatar.dto';
import { AvatarQueueService } from './worker/avatar-queue.service';
import { IPTrackingService } from 'src/common/services/iptracking.service';
import { OrganizationsService } from 'src/organizations/organizations.service';
import { DemandGenService } from 'src/demand-gen/demand-gen.service';
import { TrackingDto } from './dto/tracking.dto';
import { TrackingService } from './tracking.service';
import { SubdomainGuard } from 'src/common/guard/subdomain/subdomain.guard';
import { SubdomainRequest } from 'src/common/models/subdomain-request.model';

@ApiTags('Agents')
@Controller('api/agents')
export class AgentController {
  
  constructor(private readonly agentsService: AgentService,
    private readonly staticService: StaticFileService,
    private readonly visitorService: VisitorService,
    private readonly queueService: AvatarQueueService, 
    private readonly iptrackingService: IPTrackingService,
    private readonly orgService: OrganizationsService,
    private readonly demandGenService: DemandGenService,
    private readonly trackingService:TrackingService) {}

    async addVisitor(query: any, request: Request, orgId?: string) {
      try {
        let visitor = query.visitor ? await this.visitorService.findOne(orgId,query.visitor) : null;
        if(!visitor) {
          const ipaddress = request.headers['x-forwarded-for'];
          console.log(ipaddress)
          const ipData = await this.iptrackingService.getIPData(ipaddress);
          const headers = request.headers;
          delete headers['Authorization']
          delete headers['Proxy-Authorization']
          const visitorObj = {
            infoJson: JSON.stringify(headers),
            userAgent: headers['user-agent'],
            ipAddress: ipaddress,
            trackingInfo: JSON.stringify(ipData)
          };
          visitor = await this.visitorService.create({orgId,data:visitorObj});
        } 
        if(!query.utm_campaign && Object.keys(query).length > 1){
          const thirdPartyCampaign = await this.demandGenService.processCampaign(orgId,query);
          if(thirdPartyCampaign)
          {
            query.utm_campaign = thirdPartyCampaign.id;
          }
        }
        
        if(!query.utm_campaign && Object.keys(query).length > 1) {
          const campaign = await this.agentsService.getCampaignByParam(orgId, Object.keys(query), query);
          if(campaign) {
            query.utm_campaign = campaign.id
          }
        }
        if(!query.utm_campaign) {
          const defaultCampign = await this.agentsService.getDefaultCampaign(orgId);
          query.utm_campaign = defaultCampign.id
        }
        const visit = await this.visitorService.createOrUpdateVisit({orgId,data:{
          campaignId: query.utm_campaign,
          source: query.source,
          visitorId: visitor.id
        }});
        return {
          visit,
          visitor
        }
        
      } catch(error) {
        console.error(error)
      }
    }

  // @Post()
  // @Roles(SYSTEM_CONST.ADMIN_ROLE, SYSTEM_CONST.SUPERUSER_ROLE)
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @ApiBearerAuth()
  // @ApiBody({ type: CreateAgentDto })
  // @ApiCreatedResponse({type: Agent})
  // async create(@Body() createAgentDto: CreateAgentDto, @Req() zautoRequest: ZautoRequest) {
  //   if(zautoRequest.user && zautoRequest.user.orgId) {
  //     createAgentDto.orgId = zautoRequest.user.orgId;
  //     return await this.agentsService.create(createAgentDto);
  //   } else throw new UnauthorizedException('Unauthorised access.')
  // }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiQuery({ name: 'page', description: 'Page number.', required: false })
  @ApiQuery({ name: 'limit', description: 'Number of records in a page.', required: false })
  @ApiOkResponse({
    type: ResponseDTO<Agent>
  })
  async findAll(@Query() paginationDto: PaginationDto, @Req() request: ZautoRequest) {
    const orgId = request.user.orgId;
    return await this.agentsService.findAll({orgId,data:paginationDto});
  }

  @Get(':id')
  @ApiQuery({ name: 'source', description: 'Source of the visit', required: false })
  @ApiQuery({ name: 'campaign', description: 'Campaign for the visit', required: false })
  @ApiOkResponse({
    type: Agent
  })
  @UseGuards(SubdomainGuard)
  @ApiBearerAuth("x-tenant-id")
  async findOne(@Query() sourceQuery: any, @Param('id') id: string, @Req() request: Request) {
    const orgId = request['orgId'];
    const agent = await this.agentsService.findOne(orgId,id);
    if(sourceQuery.source) {

      const visitorData = await this.addVisitor(sourceQuery, request,orgId);
      return {
        ...agent, visitor: visitorData.visitor, visit: visitorData.visit, 
      }
    } else return agent;
  }

  @Get(':id/primary')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiQuery({ name: 'page', description: 'Page number.', required: false })
  @ApiQuery({ name: 'limit', description: 'Number of records in a page.', required: false })
  @ApiOkResponse({
    type: ResponseDTO<Agent>
  })
  async findVisitors(@Query() paginationDto: PaginationDto, @Param('id') id: string, @Req() request: ZautoRequest) {
    const orgId = request.user.orgId;
    return await this.agentsService.findAllByOrg({orgId, data:paginationDto, id});
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiBody({ type: UpdateAgentDto })
  @ApiOkResponse({type: Agent})
  async update(@Param('id') id: string, @Body() updateAgentDto: UpdateAgentDto, @Req() request: ZautoRequest) {
    const orgId = request.user.orgId;
    return await this.agentsService.update({orgId, id, data:updateAgentDto});
  }

  @Patch(':id/styles')
  @Roles(SYSTEM_CONST.ADMIN_ROLE, SYSTEM_CONST.SUPERUSER_ROLE)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiBody({ type: UpdateAgentDto })
  @ApiOkResponse({type: Agent})
  async updateStyle(@Param('id') id: string, @Body() styledata: any, @Req() request: ZautoRequest) {
    const orgId = request.user.orgId;
    return await this.agentsService.updateStyles({orgId,data:{id, styledata}});
  }

  @Patch(':id/leadInfo')
  @Roles(SYSTEM_CONST.ADMIN_ROLE, SYSTEM_CONST.SUPERUSER_ROLE)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiBody({ type: UpdateAgentDto })
  @ApiOkResponse({type: Agent})
  async updateLeadInfo(@Param('id') id: string, @Body() leadInfoObj: any, @Req() request: ZautoRequest) {
    const orgId = request.user.orgId;
    return await this.agentsService.updateLeadInfo({orgId,data:{id, leadInfo: leadInfoObj.leadInfo}});
  }

  @Patch(':id/starters')
  @Roles(SYSTEM_CONST.ADMIN_ROLE, SYSTEM_CONST.SUPERUSER_ROLE)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiBody({ type: UpdateAgentDto })
  @ApiOkResponse({type: Agent})
  async updateStarters(@Param('id') id: string, @Body() startersObj: any, @Req() request: ZautoRequest) {
    const orgId = request.user.orgId;
    return await this.agentsService.updateStarters({orgId , data: {id, starters: startersObj.starters}});
  }

  @Delete(':id')
  @Roles(SYSTEM_CONST.ADMIN_ROLE, SYSTEM_CONST.SUPERUSER_ROLE)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiNoContentResponse()
  @HttpCode(204)
  async remove(@Param('id') id: string, @Req() request: ZautoRequest) {
    const orgId = request.user.orgId;
    return await this.agentsService.remove(orgId,id);
  }

  @Post('availability')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiBody({ type: NameCheckDto })
  @ApiOkResponse({type: NameAvailability})
  async isNameAvailable(@Body() nameCheckDto: NameCheckDto, @Req() request: ZautoRequest) {
    const orgId = request.user.orgId;
    const isExist = await this.agentsService.isNameExists(orgId,nameCheckDto.name);
    return new NameAvailability(nameCheckDto.name, !isExist);
  }

  @Post(':id/logo')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './public/images',
      filename: (req, file, callback) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = extname(file.originalname.toLowerCase());
        callback(null, `${file.fieldname}-${uniqueSuffix}${extension}`);
      },
    }),
    fileFilter: (req, file, callback) => {
      // Filtering the file to be an image
      if (!file.originalname.match(/\.(jpg|jpeg|png|gif|PNG)$/)) {
        return callback(new HttpException('Only image files are allowed!', HttpStatus.BAD_REQUEST), false);
      }
      callback(null, true);
    },
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB
    },
  }))
  async uploadProfilePic(@UploadedFile() file: Multer.File, @Param('id') id: string, @Req() request: ZautoRequest) { 
    try {
      // Use sharp to compress and optionally resize the image
      const outputPath = `./public/images/compressed-${file.filename}`;
      await sharp(file.path)
        .resize(800) // Resize to width of 800 pixels, maintaining aspect ratio
        .toFormat('jpeg') // Convert to JPEG for compression
        .jpeg({ quality: 50 }) // Set the quality of the image
        .toFile(outputPath);
      const orgId = request.user.orgId;
      await this.staticService.deleteExistingFile(file.path);
      const logoUrl = `${process.env.HOST_URL}/images/compressed-${file.filename}`
      await this.agentsService.updateLogo({orgId, data: {id, logoUrl}});

      return {
        message: 'File uploaded and compressed successfully.',
        file: {
          originalName: file.originalname,
          filename: file.filename,
          size: file.size,
          mimeType: file.mimetype,
          path: logoUrl,
        },
      };
    } catch (error) {
      console.error(error);
      
      throw new HttpException('Error processing image', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post("launchAvatar")
  @Roles(SYSTEM_CONST.ADMIN_ROLE, SYSTEM_CONST.SUPERUSER_ROLE)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiBody({ type: CreateAvatarDto })
  @ApiCreatedResponse({type: Agent})
  async launchAvatar(@Body() createAvatarDto: CreateAvatarDto, @Req() zautoRequest: ZautoRequest) {
    if(zautoRequest.user && zautoRequest.user.orgId) {
      const orgId = zautoRequest.user.orgId;
      const avatarName = createAvatarDto.displayName.replaceAll(" ", "_").toLowerCase().trim();
      const avatarExists = await this.agentsService.isNameExists(orgId,avatarName);
      if(avatarExists) {
        throw new ConflictException('Avatar Name already taken.');
      } else {
        const org = await this.orgService.updateOrgWith(zautoRequest.user.orgId, createAvatarDto.companyName, createAvatarDto.companySite);
        const orgAvatar = await this.agentsService.findOneByOrg(zautoRequest.user.orgId);
        if(orgAvatar) {
          throw new ConflictException('Avatar already launched. Only one avatar can be created per Organization.');
        }
        const avatar = await this.agentsService.launchAvatarWithAssistant({orgId,data:createAvatarDto})
        await this.queueService.addTaskToQueue({
          name: 'launchAvatar',
          id: avatar.id,
          dto: createAvatarDto,
          org: org,
        });
        return avatar;
      }
      
    } else throw new UnauthorizedException('Unauthorised access.')
  }

  @Get("retryAvatarLaunch")
  @Roles(SYSTEM_CONST.ADMIN_ROLE, SYSTEM_CONST.SUPERUSER_ROLE)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse({type: Agent})
  async retryAvatarLaunch(@Req() zautoRequest: ZautoRequest) {
    if(zautoRequest.user && zautoRequest.user.orgId) {
      const orgId = zautoRequest.user.orgId;
      const org = await this.orgService.findOne(orgId)
      if(org) {
        const orgAvatar = await this.agentsService.findOneByOrg(zautoRequest.user.orgId);
        if(orgAvatar) {
          const createAvatarDto  = {
            displayName: orgAvatar.displayName,
            companyName: org.name,
            companySite: org.siteUrl
          }
          await this.agentsService.remove(orgId,orgAvatar.id);
          const avatar = await this.agentsService.launchAvatarWithAssistant({orgId,data:createAvatarDto});
          await this.queueService.addTaskToQueue({
            name: 'launchAvatar',
            id: avatar.id,
            dto: createAvatarDto,
            org: zautoRequest.user.orgId,
          });
          return avatar;
        }
        
      } else throw new NotFoundException('Organization not found.');
    } else throw new UnauthorizedException('Unauthorised access.')
  }

  @Get('widget/:orgId')
  @Header('Content-Type', 'application/javascript')
  async embedding(@Param('orgId') orgId: string, @Req() request: SubdomainRequest)
  {
    if(orgId.includes('.js'))
    {
      orgId = orgId.replace('.js','');
      return await this.agentsService.getEmbedding(orgId);
    }
    else
    {
      throw new NotFoundException("Agent not found");
    }
  }

  @Get('widget/standalone/:agentId')
  @Header('Content-Type', 'application/javascript')
  @UseGuards(SubdomainGuard)
  async standaloneEmbedding(@Param('agentId') agentId: string, @Req() request: SubdomainRequest)
  {
    const orgId = request.orgId;
    if(agentId.includes('.js'))
    {
      agentId = agentId.replace('.js','');
    }
    else
    {
      throw new NotFoundException("Agent not found");
    }
  }

  @Post(':agentId/track/:convId')
  async websiteTracking(@Param('agentId') agentId: string,@Param('convId') convId: string,@Body() trackingDto:TrackingDto, @Req() request: ZautoRequest)
  {
    const orgId = request.orgId;
    return await this.trackingService.addTracking({ orgId ,data:{convId, trackingDto}});
  }
}
