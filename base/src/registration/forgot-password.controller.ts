import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import { UpdateRegistrationDto } from './dto/update-registration.dto';
import { ApiOkResponse, ApiQuery, ApiTags } from '@nestjs/swagger';
import { RegistrationService } from './registration.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@ApiTags("Registarion")
@Controller('api/password')
export class ForgotPasswordController {
  constructor(private readonly registrationService: RegistrationService) {}

  @Post('forgot')
  async create(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return await this.registrationService.sendForgotPassword(forgotPasswordDto.email);
  }

  @Patch('change')
  async changePassword(@Body() changePasswordDto: ChangePasswordDto) {
    return this.registrationService.changePassword(changePasswordDto);
  }
}
