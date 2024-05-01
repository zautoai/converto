import { Module } from '@nestjs/common';
import { SchemaManagerService } from './schema-manager.service';
import { SchemaManagerController } from './schema-manager.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CommonModule } from 'src/common/common.module';

@Module({
  imports: [PrismaModule, CommonModule],
  controllers: [SchemaManagerController],
  providers: [SchemaManagerService],
  exports: [SchemaManagerService],
})
export class SchemaManagerModule {}
