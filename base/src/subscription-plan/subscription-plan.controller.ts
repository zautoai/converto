import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';
import { SubscriptionPlanService } from './subscription-plan.service';
import { CreateSubscriptionPlanDto } from './dto/create-subscription-plan.dto';
import { UpdateSubscriptionPlanDto } from './dto/update-subscription-plan.dto';
import { Roles } from 'src/auth/roles.decorator';
import { SYSTEM_CONST } from 'src/common/constants/system.constants';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { ResponseDTO } from 'src/common/dto/response.dto';
import { SubscriptionPlan } from './entities/subscription-plan.entity';

@ApiTags('Subscription Plans')
@Controller('api/subscription-plans')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SubscriptionPlanController {
  constructor(private readonly subscriptionPlanService: SubscriptionPlanService) {}

  @Post()
  @Roles(SYSTEM_CONST.SUPERUSER_ROLE)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Create a new subscription plan' })
  @ApiResponse({ status: 201, description: 'The record has been successfully created.' })
  async create(@Body() createSubscriptionPlanDto: CreateSubscriptionPlanDto) {
    return this.subscriptionPlanService.create(createSubscriptionPlanDto);
  }

  @Get()
  @ApiOkResponse({
    type: ResponseDTO<SubscriptionPlan>
  })
  @Roles(SYSTEM_CONST.SUPERUSER_ROLE)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Retrieve all subscription plans' })
  async findAll(@Query() paginationDto: PaginationDto) {
    return this.subscriptionPlanService.findAll(paginationDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a subscription plan by its ID' })
  async findOne(@Param('id') id: string) {
    return this.subscriptionPlanService.findOne(id);
  }

  @Patch(':id')
  @Roles(SYSTEM_CONST.SUPERUSER_ROLE)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Update a subscription plan' })
  async update(@Param('id') id: string, @Body() updateSubscriptionPlanDto: UpdateSubscriptionPlanDto) {
    return this.subscriptionPlanService.update(id, updateSubscriptionPlanDto);
  }

  @Delete(':id')
  @Roles(SYSTEM_CONST.SUPERUSER_ROLE)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Delete a subscription plan' })
  @ApiResponse({ status: 204, description: 'The record has been successfully deleted.' })
  async remove(@Param('id') id: string) {
    return this.subscriptionPlanService.remove(id);
  }
}
