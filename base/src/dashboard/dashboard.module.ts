import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { ContactsModule } from 'src/contacts/contacts.module';

@Module({
    imports: [PrismaModule, ContactsModule],
    controllers: [DashboardController],
    providers: [DashboardService]
})
export class DashboardModule { }
