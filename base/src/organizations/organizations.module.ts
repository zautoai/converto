import { Module } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { OrganizationsController } from './organizations.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CrmModule } from 'src/crm/crm.module';
import { MicroservicesModule } from 'src/microservices/microservices.module';

@Module({
  imports: [
    PrismaModule,
    CrmModule,
    MicroservicesModule
  ],
  controllers: [OrganizationsController],
  providers: [OrganizationsService],
  exports: [OrganizationsService],
})
export class OrganizationsModule {}
