import { Module } from '@nestjs/common';
import { StartupService } from './startup.service';
import { SchemaManagerModule } from 'src/schema-manager/schema-manager.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CommonModule } from 'src/common/common.module';
import { MicroservicesModule } from 'src/microservices/microservices.module';

@Module({
  imports: [
    PrismaModule, 
    SchemaManagerModule, 
    CommonModule,
    MicroservicesModule
  ], 
  providers: [
    StartupService,
  ],
})
export class StartupModule {}
