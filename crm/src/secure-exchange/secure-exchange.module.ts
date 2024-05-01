import { Module } from '@nestjs/common';
import { SecureExchangeService } from './secure-exchange.service';
import { SecureExchangeController } from './secure-exchange.controller';
import { CommonModule } from 'src/common/common.module';

@Module({
  imports: [CommonModule],
  controllers: [SecureExchangeController],
  providers: [SecureExchangeService],
})
export class SecureExchangeModule {}
