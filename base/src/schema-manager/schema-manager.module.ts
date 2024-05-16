import { Module } from '@nestjs/common';
import { SchemaManager } from './schema-manager.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CommonModule } from 'src/common/common.module';

@Module({
  imports: [PrismaModule, CommonModule],
  controllers: [],
  providers: [SchemaManager],
  exports: [SchemaManager],
})
export class SchemaManagerModule {}
