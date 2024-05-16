import { Module } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { OrganizationsController } from './organizations.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CrmModule } from 'src/crm/crm.module';
import { MicroservicesModule } from 'src/microservices/microservices.module';
import { SchemaManagerModule } from 'src/schema-manager/schema-manager.module';

@Module({
  imports: [
    PrismaModule,
    CrmModule,
    MicroservicesModule,
    SchemaManagerModule
  ],
  controllers: [OrganizationsController],
  providers: [OrganizationsService],
  exports: [OrganizationsService],
})
export class OrganizationsModule {}
