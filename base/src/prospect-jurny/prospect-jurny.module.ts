import { Module } from '@nestjs/common';
import { ProspectJurnyService } from './prospect-jurny.service';
import { ProspectJurnyController } from './prospect-jurny.controller';

@Module({
  controllers: [ProspectJurnyController],
  providers: [ProspectJurnyService],
})
export class ProspectJurnyModule {}
