import { Module } from '@nestjs/common';
import { ContactsController } from './contacts.controller';
import { ContactsService } from './contacts.service';
import { CommonModule } from 'src/common/common.module';
import { EnrichmentModule } from 'src/enrichment/enrichment.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CustomFieldsModule } from 'src/custom-fields/custom-fields.module';
import { ContactMicroserviceController } from './contacts.micro.controller';
import { ExternalCrmModule } from 'src/external-crm/external-crm.module';

@Module({
  imports: [
    CommonModule, 
    EnrichmentModule, 
    PrismaModule, 
    CustomFieldsModule,
    ExternalCrmModule,
 
  ],
  controllers: [ContactsController, ContactMicroserviceController],
  providers: [ContactsService],
  exports: [ContactsService],
})
export class ContactsModule {}
