import { Module } from '@nestjs/common';
import { NodeMailController } from './node-mail.controller';
import { NodeMailService } from './node-mail.service';

@Module({
  // No CommonModule needed now (removed SmtpService dependency)
  imports: [],
  controllers: [NodeMailController],
  providers: [NodeMailService],
})
export class NodeMailModule {}
