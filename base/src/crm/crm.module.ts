import { Module } from '@nestjs/common';
import { CrmService } from './crm.service';
import { CommonModule } from 'src/common/common.module';

@Module({
  imports: [CommonModule],
  providers: [CrmService],
  exports: [CrmService]
})
export class CrmModule {}
