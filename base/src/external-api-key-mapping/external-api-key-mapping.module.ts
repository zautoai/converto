import { Module } from '@nestjs/common';
import { ExternalApiKeyMappingService } from './external-api-key-mapping.service';
import { ExternalApiKeyMappingController } from './external-api-key-mapping.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [ExternalApiKeyMappingService],
  controllers: [ExternalApiKeyMappingController]
})
export class ExternalApiKeyMappingModule {}
