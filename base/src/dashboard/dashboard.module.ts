import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';

@Module({
    imports: [PrismaModule],
    controllers: [DashboardController],
    providers:[DashboardService]
})
export class DashboardModule {}
