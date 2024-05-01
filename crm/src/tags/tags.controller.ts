import {
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
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { FilterDto } from 'src/common/dtos/filter.dto';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { IRequest } from 'src/common/model/request.model';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { TagsService } from './tags.service';

@ApiTags('Tags')
@Controller('tags')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class TagsController {
  constructor(private tagsService: TagsService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all tags for an organization',
    description: 'Endpoint to get all tags for an organization.',
  })
  async getAllTags(@Query() filterDto: FilterDto, @Req() request: IRequest) {
    if (request.orgId) {
      return this.tagsService.getAllTags(request.orgId, filterDto);
    } else {
      throw new UnauthorizedException('Unauthorized access');
    }
  }

  @Get(':id')
  async getTagById(@Req() request: IRequest, @Param('id') id: string) {
    if (request.orgId) {
      return this.tagsService.getTagById(request.orgId, id);
    }
    throw new UnauthorizedException('Unauthorized access');
  }

  @ApiOperation({
    summary: 'Create a tag for an organization',
    description: 'Endpoint to create a tag for an organization.',
  })
  @Post()
  async createTag(
    @Req() request: IRequest,
    @Body() createTagDto: CreateTagDto,
  ) {
    if (request.orgId) {
      return this.tagsService.createTag(request.orgId, createTagDto);
    } else {
      throw new UnauthorizedException('Unauthorized access');
    }
  }

  @ApiOperation({
    summary: 'Update a tag for an organization',
    description: 'Endpoint to update a tag for an organization.',
  })
  @ApiParam({
    name: 'id',
    description: 'The unique identifier of the tag',
  })
  @Patch(':id')
  async updateTag(
    @Req() request: IRequest,
    @Param('id') id: string,
    @Body() updateTagDto: UpdateTagDto,
  ) {
    if (request.orgId) {
      console.log(id, updateTagDto);

      return this.tagsService.updateTag(request.orgId, id, updateTagDto);
    } else {
      throw new UnauthorizedException('Unauthorized access');
    }
  }

  @ApiOperation({
    summary: 'Delete a tag for an organization',
    description: 'Endpoint to delete a tag for an organization.',
  })
  @Delete(':id')
  async deleteTag(@Req() request: IRequest, @Param('id') id: string) {
    if (request.orgId) {
      return this.tagsService.deleteTag(request.orgId, id);
    } else {
      throw new UnauthorizedException('Unauthorized access');
    }
  }
}
