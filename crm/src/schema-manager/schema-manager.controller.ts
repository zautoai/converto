import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { SchemaManagerService } from './schema-manager.service';
import { CreateSchemaManagerDto } from './dto/create-schema-manager.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiProperty,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { IRequest } from 'src/common/model/request.model';

@ApiTags('Schema Manager')
@Controller('schema-manager')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class SchemaManagerController {
  constructor(private readonly schemaManagerService: SchemaManagerService) { }

  @Post()
  @ApiOperation({
    summary: 'Create a new schema for an organization',
    description: 'Endpoint to create a new schema for an organization.',
  })
  create(
    @Body() createSchemaManagerDto: CreateSchemaManagerDto,
    @Req() req: IRequest,
  ) {
    createSchemaManagerDto.orgId = req.orgId;
    const rollback = () => {
      this.schemaManagerService.delete(createSchemaManagerDto.orgId);
    };
    return this.schemaManagerService.create(createSchemaManagerDto.orgId, rollback);
  }

  @Post(':orgId/migrate')
  @ApiOperation({
    summary: 'Migrate schema for an organization',
    description: 'Endpoint to migrate schema for a specific organization.',
  })
  @ApiParam({
    name: 'orgId',
    description: 'The unique identifier of the organization',
  })
  migrate(@Param('orgId') orgId: string, @Req() req: IRequest) {
    return this.schemaManagerService.migrate(orgId);
  }

  @Delete(':orgId')
  @ApiOperation({
    summary: 'Migrate schema for an organization',
    description: 'Endpoint to migrate schema for a specific organization.',
  })
  @ApiParam({
    name: 'orgId',
    description: 'The unique identifier of the organization',
  })
  remove(@Param('orgId') orgId: string, @Req() req: IRequest) {
    return this.schemaManagerService.delete(orgId);
  }
}
