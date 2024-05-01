import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtTokenService } from 'src/common/services/jwt-token.service';
import { ExchangeTokenDto } from './dto/exchange-token.dto';
import { DEFAULT_SECRET_KEY } from 'src/common/constants/system.constants';

@Injectable()
export class SecureExchangeService {
  constructor(private readonly tokenService: JwtTokenService) {}

  async verifyAccessToken(token: string) {
    try {
      return await this.tokenService.verifyAccessToken(token);
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async exchangeAccessToken(exchangeTokenDto: ExchangeTokenDto) {
    if (!this.validateSecretKey(exchangeTokenDto.secretKey)) {
      throw new UnauthorizedException('Invalid Secret Key');
    }
    try {
      delete exchangeTokenDto.secretKey;
      const payload = {
        ...exchangeTokenDto,
        type: 'access-token',
      };
      const token = await this.tokenService.generateAccessToken(payload);
      return {
        token,
      };
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  private validateSecretKey(secretKey: string): Boolean {
    if (!secretKey) {
      return false;
    }
    if (secretKey !== DEFAULT_SECRET_KEY) {
      return false;
    }
    return true;
  }
}
