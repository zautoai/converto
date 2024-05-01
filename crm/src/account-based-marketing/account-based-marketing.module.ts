import { Module } from '@nestjs/common';
import { AccountBasedMarketingService } from './account-based-marketing.service';
import { AccountBasedMarketingController } from './account-based-marketing.controller';
import { CommonModule } from 'src/common/common.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CustomFieldsModule } from 'src/custom-fields/custom-fields.module';

@Module({
  imports: [CommonModule, PrismaModule, CustomFieldsModule],
  controllers: [AccountBasedMarketingController],
  providers: [AccountBasedMarketingService],
  exports: [AccountBasedMarketingService],
})
export class AccountBasedMarketingModule {}
