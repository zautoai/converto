import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, HttpCode, Req, UnauthorizedException, NotAcceptableException } from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { ApiBearerAuth, ApiNoContentResponse, ApiOkResponse, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/auth/roles.decorator';
import { SYSTEM_CONST } from 'src/common/constants/system.constants';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { ResponseDTO } from 'src/common/dto/response.dto';
import { Conversation } from './entities/conversation.entity';
import { ZautoRequest } from 'src/common/models/request.model';
import { ConversationFilterDto } from './dto/conversation-filter.dto';
import { SubdomainGuard } from 'src/common/guard/subdomain/subdomain.guard';
import { SubdomainRequest } from 'src/common/models/subdomain-request.model';


@ApiTags('Conversations')
@Controller('api/conversations')
export class ConversationController {
  constructor(
    private readonly conversationService: ConversationService
    ) {}

  @Post()
  @UseGuards(SubdomainGuard)
  async create(@Body() createConversationDto: CreateConversationDto, @Req() request: SubdomainRequest) {
    const orgId = request.orgId;
    if(orgId) {
      return await this.conversationService.create({ orgId ,data: createConversationDto});
    } else {
      throw new UnauthorizedException('Org info not found.')
    
    }
    
  }

    @Get()
    @ApiQuery({ name: 'page', description: 'Page number.', required: false })
    @ApiQuery({ name: 'limit', description: 'Number of records in a page.', required: false })
    @Roles(SYSTEM_CONST.ADMIN_ROLE, SYSTEM_CONST.SUPERUSER_ROLE)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiBearerAuth()
    @ApiOkResponse({
      type: ResponseDTO<Conversation>
    })
    async findAll(@Query() filterDto: ConversationFilterDto,@Req() request: ZautoRequest)
    {
        if(request.user && request.user.orgId)
        {
            const orgId = request.user.orgId;
            return await this.conversationService.findAll({orgId,data:filterDto});
        }
        else
        {
            throw new UnauthorizedException("Unauthorised access.")
        }
    }

  @Get(':id')
  @Roles(SYSTEM_CONST.ADMIN_ROLE, SYSTEM_CONST.SUPERUSER_ROLE)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOkResponse({type: Conversation})
  async findOne(@Param('id') id: string,@Req() request: ZautoRequest) {
    if(request.user && request.user.orgId)
    {
      const orgId = request.user.orgId;
      return await this.conversationService.findOne(orgId,id);
    }
    else
    {
      throw new UnauthorizedException('You are not authorized to access this resource')
    }
  }

  @Get(':id/summary')
  @Roles(SYSTEM_CONST.ADMIN_ROLE, SYSTEM_CONST.SUPERUSER_ROLE)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOkResponse({type: Conversation})
  async getSummary(@Param('id') id: string,@Req() request: ZautoRequest) {
    if(request.user && request.user.orgId)
    {
      const orgId = request.user.orgId;
      return await this.conversationService.findOneWithSummary(orgId,id);
    }
    else
    {
      throw new UnauthorizedException('You are not authorized to access this resource')
    }
  }

  @Patch(':id')
  @Roles(SYSTEM_CONST.ADMIN_ROLE, SYSTEM_CONST.SUPERUSER_ROLE)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOkResponse({type: Conversation})
  async update(@Param('id') id: string, @Body() updateConversationDto: any) {
    //return await this.conversationService.update(id, updateConversationDto);
  }

  @Delete(':id')
  @Roles(SYSTEM_CONST.ADMIN_ROLE, SYSTEM_CONST.SUPERUSER_ROLE)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiNoContentResponse()
  @HttpCode(204)
  async remove(@Param('id') id: string,@Req() request: ZautoRequest) {

    if(request.user && request.user.orgId)
    {
      const orgId = request.user.orgId;
      return await this.conversationService.findOne(orgId, id);
    }
    else
    {
      throw new UnauthorizedException('You are not authorized to access this resource')
    }
  }

  //update message
  @Patch('/message/:id')
  @UseGuards(SubdomainGuard)
  @ApiOkResponse({type: Conversation})
  async updateMessage(@Param('id') id: string, @Body() updateMessageDto: any,@Req() request: SubdomainRequest) {
    const orgId = request.orgId;
    return await this.conversationService.updateMessage({orgId,data:{id,updateMessageDto}});
  }
}
