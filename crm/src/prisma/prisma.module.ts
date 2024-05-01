import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { PrismaClientManager } from './prismaClientManager.service';

@Module({
  providers: [PrismaService, PrismaClientManager],
  exports: [PrismaService, PrismaClientManager],
})
export class PrismaModule {}
