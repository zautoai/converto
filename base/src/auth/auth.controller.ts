//src/auth/auth.controller.ts

import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AuthEntity } from './entities/auth.entity';
import { LoginDTO } from './dto/login.dto';
import { User } from 'src/users/entities/user.entity';
import { JwtAuthGuard } from './jwt-auth.guard';
import { ZautoRequest } from 'src/common/models/request.model';
import { MessagePattern } from '@nestjs/microservices';

@Controller('api/auth')
@ApiTags('Authendication')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOkResponse({ type: AuthEntity })
  async login(@Body() { email, password }: LoginDTO) {
    return await this.authService.login(email, password);
  }

  @Get('verify')
  @ApiTags('Roles')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({type: User})
  async verify(@Req() request: ZautoRequest) {
    return this.authService.getUserInfo(request.user);
  }

  @MessagePattern({cmd:"VERIFY_TOKEN"})
  async verifyToken(token: string) {
    return await this.authService.verifyToken(token);
  }
}