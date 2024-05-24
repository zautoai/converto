import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { PrismaClientManager } from './prisma-client-manager.service';

@Module({
  exports: [PrismaService,PrismaClientManager],
  providers: [PrismaService, PrismaClientManager]
})
export class PrismaModule {}
