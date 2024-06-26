import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { ContactsModule } from 'src/contacts/contacts.module';
import { AccountsModule } from 'src/accounts/accounts.module';
import { MicroservicesModule } from 'src/microservices/microservices.module';

@Module({
    imports: [PrismaModule, ContactsModule,AccountsModule,MicroservicesModule],
    controllers: [DashboardController],
    providers: [DashboardService]
})
export class DashboardModule { }
