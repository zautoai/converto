import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { SecureExchangeService } from './secure-exchange.service';
import { ApiTags } from '@nestjs/swagger';
import { JwtTokenService } from 'src/common/services/jwt-token.service';
import { ExchangeTokenDto } from './dto/exchange-token.dto';

@ApiTags('Secure Exchange')
@Controller('secure-exchange')
export class SecureExchangeController {
  constructor(private readonly secureExchangeService: SecureExchangeService) {}

  @Post('exchange-token')
  async exchangeToken(@Body() exchangeTokenDto: ExchangeTokenDto) {
    return await this.secureExchangeService.exchangeAccessToken(
      exchangeTokenDto,
    );
  }

  @Get('verify-token')
  async verifyToken(@Query('token') token: string) {
    return await this.secureExchangeService.verifyAccessToken(token);
  }
}
