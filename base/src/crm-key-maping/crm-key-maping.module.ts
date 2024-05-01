import { Module } from '@nestjs/common';
import { CrmKeyMapingService } from './crm-key-maping.service';
import { CrmKeyMapingController } from './crm-key-maping.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ExternalToolModule } from 'src/external-tool/external-tool.module';
import { OauthModule } from 'src/oauth/oauth.module';
import { CrmConnectorService } from './crm-connector.service';
import { OrgToolModule } from 'src/org-tool/org-tool.module';

@Module({
  imports:[PrismaModule,ExternalToolModule,OauthModule,OrgToolModule],
  providers: [CrmKeyMapingService,CrmConnectorService],
  controllers: [CrmKeyMapingController],
  exports: [CrmConnectorService]
})
export class CrmKeyMapingModule {}
