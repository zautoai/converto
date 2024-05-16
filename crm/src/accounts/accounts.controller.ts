import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UnauthorizedException,
  UseGuards,
  Query,
} from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { IRequest } from 'src/common/model/request.model';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { FilterDto } from 'src/common/dtos/filter.dto';

@ApiTags('Accounts')
@Controller('accounts')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) { }

  @Post()
  @ApiOperation({ description: 'Create Account', summary: 'Create Account' })
  create(@Body() createAccountDto: CreateAccountDto, @Req() req: IRequest) {
    console.log(createAccountDto);

    if (req.orgId) {
      const orgId = req.orgId;
      return this.accountsService.create(orgId, createAccountDto);
    }
    throw new UnauthorizedException('Organization not found');
  }

  @Get()
  @ApiOperation({
    description: 'Get All Accounts',
    summary: 'Get All Accounts',
  })
  findAll(@Req() req: IRequest, @Query() filterDto: FilterDto) {
    if (req.orgId) {
      const orgId = req.orgId;
      return this.accountsService.findAll(orgId, filterDto);
    }
    throw new UnauthorizedException('Organization not found');
  }

  @ApiOperation({
    description: 'Get Account Fields',
    summary: 'Get Account Fields',
  })
  @Get('fields')
  async getFields(@Req() request: IRequest) {
    if (request.orgId) {
      return this.accountsService.getAccountFields(request.orgId);
    } else {
      throw new UnauthorizedException('Unauthorized access');
    }
  }

  @Get('abm')
  async getAbm(@Req() request: IRequest, @Query() filterDto: FilterDto) {
    if (request.orgId) {
      return this.accountsService.getAbm(request.orgId, filterDto);
    } else {
      throw new UnauthorizedException('Unauthorized access');
    }
  }

  @Get('abm/:id')
  async getAbmById(@Req() request: IRequest, @Param('id') id: string) {
    if (request.orgId) {
      return this.accountsService.getAbmById(request.orgId, id);
    } else {
      throw new UnauthorizedException('Unauthorized access');
    }
  }

  @Get(':id')
  @ApiOperation({
    description: 'Get Account By Id',
    summary: 'Get Account By Id',
  })
  findOne(@Param('id') id: string, @Req() req: IRequest) {
    if (req.orgId) {
      const orgId = req.orgId;
      return this.accountsService.findOne(orgId, id);
    }
    throw new UnauthorizedException('Organization not found');
  }

  @Patch(':id')
  @ApiOperation({ description: 'Update Account', summary: 'Update Account' })
  update(
    @Param('id') id: string,
    @Body() updateAccountDto: UpdateAccountDto,
    @Req() req: IRequest,
  ) {
    if (req.orgId) {
      const orgId = req.orgId;
      return this.accountsService.update(orgId, id, updateAccountDto);
    }
    throw new UnauthorizedException('Organization not found');
  }

  @Delete(':id')
  @ApiOperation({ description: 'Delete Account', summary: 'Delete Account' })
  remove(@Param('id') id: string, @Req() req: IRequest) {
    if (req.orgId) {
      const orgId = req.orgId;
      return this.accountsService.remove(orgId, id);
    }
    throw new UnauthorizedException('Organization not found');
  }
}
