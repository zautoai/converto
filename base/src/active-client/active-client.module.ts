import { Module } from '@nestjs/common';
import { ActiveClientService } from './active-client.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
    providers: [
        ActiveClientService
    ], 
    exports: [
        ActiveClientService
    ],
    imports:[
        PrismaModule
    ]
})
export class ActiveClientModule {}
