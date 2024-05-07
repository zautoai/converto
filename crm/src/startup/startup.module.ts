import { Module } from '@nestjs/common';
import { StartupService } from './startup.service';
import { SchemaManagerModule } from 'src/schema-manager/schema-manager.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CommonModule } from 'src/common/common.module';
import { MicroservicesModule } from 'src/microservices/microservices.module';
import { StartupMicroserviceController } from './startup.micro.controller';

@Module({
  imports: [
    PrismaModule,
    SchemaManagerModule,
    CommonModule,
    MicroservicesModule,
  ],
  controllers: [StartupMicroserviceController],
  providers: [
    StartupService,
  ],
})
export class StartupModule { }
