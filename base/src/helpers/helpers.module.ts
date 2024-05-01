import { Module } from '@nestjs/common';
import { HelpersService } from './helpers.service';
import { HelpersController } from './helpers.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { LlmModule } from 'src/llm/llm.module';

@Module({
  imports: [PrismaModule, LlmModule],
  controllers: [HelpersController],
  providers: [HelpersService],
  exports: [HelpersService]
})
export class HelpersModule {}
