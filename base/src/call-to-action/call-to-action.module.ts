import { Module } from '@nestjs/common';
import { CallToActionService } from './call-to-action.service';
import { CallToActionController } from './call-to-action.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AssistantsModule } from 'src/assistants/assistants.module';

@Module({
  imports: [
    PrismaModule,
    AssistantsModule
  ],
  providers: [CallToActionService],
  controllers: [CallToActionController]
})
export class CallToActionModule {}
