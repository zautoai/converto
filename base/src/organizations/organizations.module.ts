import { Module } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { OrganizationsController } from './organizations.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CrmModule } from 'src/crm/crm.module';

@Module({
  imports: [
    PrismaModule,
    CrmModule
  ],
  controllers: [OrganizationsController],
  providers: [OrganizationsService],
  exports: [OrganizationsService],
})
export class OrganizationsModule {}
