import { Module } from '@nestjs/common';
import { FormBuilderService } from './form-builder.service';
import { FormBuilderController } from './form-builder.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CommonModule } from 'src/common/common.module';
import { ContactsModule } from 'src/contacts/contacts.module';
import { FormBuilderMicroserviceController } from './form-builder.micro.controller';

@Module({
  imports: [PrismaModule, CommonModule, ContactsModule],
  controllers: [FormBuilderController,FormBuilderMicroserviceController],
  providers: [FormBuilderService],
})
export class FormBuilderModule {}
