import { Module } from '@nestjs/common';
import { OrgToolService } from './org-tool.service';
import { OrgToolController } from './org-tool.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [OrgToolService],
  controllers: [OrgToolController],
  exports: [OrgToolService]
})
export class OrgToolModule {}
