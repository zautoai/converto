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
  UnauthorizedException,
} from '@nestjs/common';
import { AccountBasedMarketingService } from './account-based-marketing.service';
import { CreateAccountBasedMarketingDto } from './dto/create-account-based-marketing.dto';
import { UpdateAccountBasedMarketingDto } from './dto/update-account-based-marketing.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { IRequest } from 'src/common/model/request.model';

@ApiTags('Account Based Marketing')
@Controller('account-based-marketing')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class AccountBasedMarketingController {
  constructor(
    private readonly accountBasedMarketingService: AccountBasedMarketingService,
  ) {}

  @ApiOperation({
    summary: 'Get all Account Based Marketing',
    description: 'Endpoint to get all Account Based Marketing.',
  })
  @Get()
  async findAll(@Req() request: IRequest) {
    if (request.orgId) {
      return await this.accountBasedMarketingService.findAll(request.orgId);
    } else {
      throw new UnauthorizedException('Unauthorized access');
    }
  }

  @ApiOperation({
    summary: 'Get Account Based Marketing by id',
    description: 'Endpoint to get Account Based Marketing by id.',
  })
  @Get(':id')
  async findOne(@Req() request: IRequest, @Param('id') id: string) {
    if (request.orgId) {
      return await this.accountBasedMarketingService.findOne(
        request.orgId,
        id,
      );
    } else {
      throw new UnauthorizedException('Unauthorized access');
    }
  }

  @ApiOperation({
    summary: 'Create Account Based Marketing',
    description: 'Endpoint to create an Account Based Marketing.',
  })
  @Post()
  async create(
    @Req() request: IRequest,
    @Body() createAccountBasedMarketingDto: CreateAccountBasedMarketingDto,
  ) {
    if (request.orgId) {
      return await this.accountBasedMarketingService.create(
        request.orgId,
        createAccountBasedMarketingDto,
      );
    } else {
      throw new UnauthorizedException('Unauthorized access');
    }
  }

  @ApiOperation({
    summary: 'Update Account Based Marketing',
    description: 'Endpoint to update an Account Based Marketing.',
  })
  @Patch(':id')
  async update(
    @Req() request: IRequest,
    @Param('id') id: string,
    @Body() updateAccountBasedMarketingDto: UpdateAccountBasedMarketingDto,
  ) {
    if (request.orgId) {
      return await this.accountBasedMarketingService.update(
        request.orgId,
        id,
        updateAccountBasedMarketingDto,
      );
    } else {
      throw new UnauthorizedException('Unauthorized access');
    }
  }

  @ApiOperation({
    summary: 'Delete Account Based Marketing',
    description: 'Endpoint to delete an Account Based Marketing.',
  })
  @Delete(':id')
  async remove(@Req() request: IRequest, @Param('id') id: string) {
    if (request.orgId) {
      return await this.accountBasedMarketingService.remove(request.orgId, id);
    } else {
      throw new UnauthorizedException('Unauthorized access');
    }
  }
}
