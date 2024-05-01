import { Module } from '@nestjs/common';
import { OrgSmtpconfigController } from './org-smtpconfig.controller';
import { OrgSmtpconfigService } from './org-smtpconfig.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { OrganizationsModule } from 'src/organizations/organizations.module';
import { CommonModule } from 'src/common/common.module';


@Module({
  imports:[PrismaModule, OrganizationsModule,CommonModule],
  controllers: [OrgSmtpconfigController],
  providers: [OrgSmtpconfigService]
})
export class OrgSmtpconfigModule {}
