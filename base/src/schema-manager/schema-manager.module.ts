import { Module } from '@nestjs/common';
import { SchemaManagerService } from './schema-manager.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CommonModule } from 'src/common/common.module';

@Module({
  imports: [PrismaModule, CommonModule],
  controllers: [],
  providers: [SchemaManagerService],
  exports: [SchemaManagerService],
})
export class SchemaManagerModule {}
