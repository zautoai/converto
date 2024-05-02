import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { AccountBasedMaretingService } from './account-based-mareting.service';
import { CreateAccountBasedMaretingDto } from './dto/create-account-based-mareting.dto';
import { UpdateAccountBasedMaretingDto } from './dto/update-account-based-mareting.dto';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@ApiTags('Account Based Mareting')
@Controller('account-based-mareting')
@UseGuards(JwtAuthGuard)
export class AccountBasedMaretingController {
  constructor(private readonly accountBasedMaretingService: AccountBasedMaretingService) {}

  @Post()
  create(@Body() createAccountBasedMaretingDto: CreateAccountBasedMaretingDto) {
    return this.accountBasedMaretingService.create(createAccountBasedMaretingDto);
  }

  @Get()
  findAll() {
    return this.accountBasedMaretingService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.accountBasedMaretingService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAccountBasedMaretingDto: UpdateAccountBasedMaretingDto) {
    return this.accountBasedMaretingService.update(+id, updateAccountBasedMaretingDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.accountBasedMaretingService.remove(+id);
  }
}
