import { Module } from '@nestjs/common';
import { ExternalToolService } from './external-tool.service';
import { ExternalToolController } from './external-tool.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [ExternalToolService],
  controllers: [ExternalToolController],
  exports: [ExternalToolService]
})
export class ExternalToolModule {}
