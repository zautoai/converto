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


@ApiTags('Conversations')
@Controller('api/conversations')
export class ConversationController {
  constructor(
    private readonly conversationService: ConversationService
    ) {}

  @Post()
  async create(@Body() createConversationDto: CreateConversationDto, @Req() request: ZautoRequest) {
    if(request.user && request.user.orgId) {
      const orgId = request.user.orgId;
      return await this.conversationService.create(createConversationDto, orgId);
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
    async findAll(@Query() filterDto: ConversationFilterDto,@Req() zautoRequest: ZautoRequest)
    {
        if(zautoRequest.user && zautoRequest.orgId)
        {
            const orgId = zautoRequest.orgId;
            return await this.conversationService.findAllByOrg(orgId,filterDto);
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
  async findOne(@Param('id') id: string) {
    return await this.conversationService.findOne(id);
  }

  @Get(':id/summary')
  @Roles(SYSTEM_CONST.ADMIN_ROLE, SYSTEM_CONST.SUPERUSER_ROLE)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOkResponse({type: Conversation})
  async getSummary(@Param('id') id: string) {
    return await this.conversationService.findOneWithSummary(id);
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
  async remove(@Param('id') id: string) {
    await this.conversationService.remove(id);
  }

  //update message
  @Patch('/message/:id')
  @ApiOkResponse({type: Conversation})
  async updateMessage(@Param('id') id: string, @Body() updateMessageDto: any) {
    return await this.conversationService.updateMessage(id,updateMessageDto);
  }
}
