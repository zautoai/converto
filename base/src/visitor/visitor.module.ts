import { Module } from '@nestjs/common';
import { VisitorService } from './visitor.service';
import { VisitorController } from './visitor.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AgentVisitorController } from './agent-visitor.controlle';
import { CommonModule } from 'src/common/common.module';

@Module({
  imports: [PrismaModule,CommonModule],
  controllers: [VisitorController, AgentVisitorController],
  providers: [VisitorService],
  exports: [VisitorService]
})
export class VisitorModule {}
