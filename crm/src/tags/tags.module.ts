import { Module } from '@nestjs/common';
import { TagsController } from './tags.controller';
import { TagsService } from './tags.service';
import { PrismaClientManager } from 'src/prisma/prismaClientManager.service';
import { CommonModule } from 'src/common/common.module';

@Module({
  imports: [CommonModule],
  controllers: [TagsController],
  providers: [TagsService, PrismaClientManager],
})
export class TagsModule {}
