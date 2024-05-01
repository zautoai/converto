import { Module } from '@nestjs/common';
import { VisitorService } from './visitor.service';
import { VisitorController } from './visitor.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AgentVisitorController } from './agent-visitor.controlle';

@Module({
  imports: [PrismaModule],
  controllers: [VisitorController, AgentVisitorController],
  providers: [VisitorService],
  exports: [VisitorService]
})
export class VisitorModule {}
