import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, UnauthorizedException } from '@nestjs/common';
import { PromptTemplateService } from './prompt-template.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ZautoRequest } from 'src/common/models/request.model';
import { SelectTemplateDto } from './dto/select-template.dto';
import { CustomeTemplateDto } from './dto/custom-template.dto';

@ApiTags('Propmt Templates')
@Controller('api/prompt-template')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PromptTemplateController {
  constructor(private readonly promptTemplateService: PromptTemplateService) {}

  @Get()
  async findAll() {
    return this.promptTemplateService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.promptTemplateService.findOne(+id);
  }

  @Post()
  async selectTemplate(@Body() selectTemplateDto:SelectTemplateDto,@Req() request: ZautoRequest)
  {
    if(request.user)
    {
      const orgId = request.user.org.id;
      return await this.promptTemplateService.selectTemplate(orgId,selectTemplateDto);
    }
    else
    {
      throw new UnauthorizedException();
    }
  } 

  @Post('/custom')
  async customTemplate(@Body() customeTemplateDto: CustomeTemplateDto,@Req() request: ZautoRequest)
  {
    if(request.user)
    {
      const orgId = request.user.org.id;
      return await this.promptTemplateService.customePrompt(orgId,customeTemplateDto);
    }
    else
    {
      throw new UnauthorizedException();
    }
  }

}
