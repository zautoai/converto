import { Module } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { OrganizationsController } from './organizations.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { MicroservicesModule } from 'src/microservices/microservices.module';
import { SchemaManagerModule } from 'src/schema-manager/schema-manager.module';
import { RolesModule } from 'src/roles/roles.module';

@Module({
  imports: [
    PrismaModule,
    MicroservicesModule,
    SchemaManagerModule,
    RolesModule
  ],
  controllers: [OrganizationsController],
  providers: [OrganizationsService],
  exports: [OrganizationsService],
})
export class OrganizationsModule {}
