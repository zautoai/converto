import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import { UpdateRegistrationDto } from './dto/update-registration.dto';
import { ApiOkResponse, ApiQuery, ApiTags } from '@nestjs/swagger';
import { RegistrationService } from './registration.service';
import { ResendVerificationDto } from './dto/resend-verification.dto';

@ApiTags("Registarion")
@Controller('api/registration')
export class RegistrationController {
  constructor(private readonly registrationService: RegistrationService) {}

  @Post()
  create(@Body() createRegistrationDto: CreateRegistrationDto) {
    return this.registrationService.create(createRegistrationDto);
  }
  
  @Get('verify')
  @ApiQuery({ name: 'token', description: 'EmailVerification Token', required: true })
  @ApiOkResponse()
  async verifyEmailToken(@Query() { token }: any) {
    return await this.registrationService.verifyToken(token);
  }

  @Post('resendVerification')
  @ApiQuery({ name: 'token', description: 'EmailVerification Token', required: true })
  @ApiOkResponse()
  async resendVerification(@Body() createRegistrationDto: ResendVerificationDto) {
    return await this.registrationService.resendVerification(createRegistrationDto.email);
  }

}
