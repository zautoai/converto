import { Module } from '@nestjs/common';
import { ContactsService } from './contacts.service';
import { ContactsController } from './contacts.controller';
import { MicroservicesModule } from 'src/microservices/microservices.module';
import { BullModule } from '@nestjs/bull';

@Module({
  imports:[
    MicroservicesModule,
    BullModule.registerQueue({
      name: 'icp_score_queue'
    }),
  ],
  controllers: [ContactsController],
  providers: [ContactsService],
  exports: [ContactsService]
})
export class ContactsModule {}
