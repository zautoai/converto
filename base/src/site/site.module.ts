import { Module } from '@nestjs/common';
import { SiteService } from './site.service';
import { SiteController } from './site.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ChromaModule } from 'src/chroma/chroma.module';
import { CommonModule } from 'src/common/common.module';
import { AgentSiteController } from './agent-site.controller';
import { AccountModule } from 'src/account/account.module';
import { AssistantsModule } from 'src/assistants/assistants.module';


@Module({
  imports: [
    PrismaModule, 
    ChromaModule,
    CommonModule,
    AccountModule,
    AssistantsModule
  ],
  controllers: [SiteController, AgentSiteController],
  providers: [SiteService],
  exports: [SiteService]
})
export class SiteModule {}
