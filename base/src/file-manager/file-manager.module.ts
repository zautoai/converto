import { Module } from '@nestjs/common';
import { FileManagerService } from './file-manager.service';
import { FileManagerController } from './file-manager.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CommonModule } from 'src/common/common.module';
import { ChromaModule } from 'src/chroma/chroma.module';

@Module({
  imports: [PrismaModule,CommonModule,ChromaModule],
  providers: [FileManagerService],
  controllers: [FileManagerController]
})
export class FileManagerModule {}
