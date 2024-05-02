import { Module } from '@nestjs/common';
import { FormBuilderService } from './form-builder.service';
import { FormBuilderController } from './form-builder.controller';
import { MicroservicesModule } from 'src/microservices/microservices.module';

@Module({
  imports: [
    MicroservicesModule
  ],
  controllers: [FormBuilderController],
  providers: [FormBuilderService],
})
export class FormBuilderModule {}
