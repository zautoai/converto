import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; // Adjust the import based on your setup
import { CreateSubscriptionPlanDto } from './dto/create-subscription-plan.dto';
import { UpdateSubscriptionPlanDto } from './dto/update-subscription-plan.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class SubscriptionPlanService {
  constructor(private prisma: PrismaService) {}

  async create(createSubscriptionPlanDto: CreateSubscriptionPlanDto) {
    try {
      const plan = await this.prisma.subscriptionPlan.findUnique({
        where: {name: createSubscriptionPlanDto.name}
      })
      if(plan) {
        throw new ConflictException(`Plan ${createSubscriptionPlanDto.name} already exists.`)
      }
      return this.prisma.subscriptionPlan.create({
        data: createSubscriptionPlanDto
      });
    } catch(error) {
      throw new BadRequestException(error.message)
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;
    const skip = (page - 1) * limit;
    const roleData =  await this.prisma.subscriptionPlan.findMany({skip, take: limit});
    const total = await this.prisma.subscriptionPlan.count();
    return {
      data: roleData,
      page: page,
      total: total
    };
  }

  async findOne(id: string) {
    const subscriptionPlan = await this.prisma.subscriptionPlan.findUnique({
      where: { id },
    });

    if (!subscriptionPlan) {
      throw new NotFoundException(`Subscription Plan with ID "${id}" not found`);
    }

    return subscriptionPlan;
  }

  async update(id: string, updateSubscriptionPlanDto: UpdateSubscriptionPlanDto) {
    try {
      return await this.prisma.subscriptionPlan.update({
        where: { id },
        data: updateSubscriptionPlanDto,
      });
    } catch (error) {
      throw new NotFoundException(`Subscription Plan with ID "${id}" not found`);
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.subscriptionPlan.delete({
        where: { id },
      });
    } catch (error) {
      throw new NotFoundException(`Subscription Plan with ID "${id}" not found`);
    }
  }
  
}
