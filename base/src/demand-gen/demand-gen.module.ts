import { Module } from '@nestjs/common';
import { DemandGenService } from './demand-gen.service';
import { DemandGenController } from './demand-gen.controller';
import { LlmModule } from 'src/llm/llm.module';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports:[LlmModule,PrismaModule],
  controllers: [DemandGenController],
  providers: [DemandGenService],
  exports: [DemandGenService]
})
export class DemandGenModule {}
