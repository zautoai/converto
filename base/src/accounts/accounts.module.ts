import { Module } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { AccountsController } from './accounts.controller';
import { MicroservicesModule } from 'src/microservices/microservices.module';

@Module({
  imports: [MicroservicesModule],
  controllers: [AccountsController],
  providers: [AccountsService],
})
export class AccountsModule {}
