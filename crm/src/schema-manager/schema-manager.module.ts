import { Module } from '@nestjs/common';
import { SchemaManagerService } from './schema-manager.service';
import { SchemaManagerController } from './schema-manager.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CommonModule } from 'src/common/common.module';
import { SchemaManagerMicroserviceController } from './schema-manager.micro.controller';

@Module({
  imports: [PrismaModule, CommonModule],
  controllers: [SchemaManagerController,SchemaManagerMicroserviceController],
  providers: [SchemaManagerService],
  exports: [SchemaManagerService],
})
export class SchemaManagerModule {}
