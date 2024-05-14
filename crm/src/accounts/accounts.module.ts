import { Module } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { AccountsController } from './accounts.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CommonModule } from 'src/common/common.module';
import { CustomFieldsModule } from 'src/custom-fields/custom-fields.module';
import { AccountsMicroController } from './accounts.micro.controller';
import { ExternalCrmModule } from 'src/external-crm/external-crm.module';

@Module({
  imports: [
    CommonModule,
    PrismaModule, 
    CustomFieldsModule,
    ExternalCrmModule,
  ],
  controllers: [AccountsController,AccountsMicroController],
  providers: [AccountsService],
  exports: [AccountsService],
})
export class AccountsModule {}
