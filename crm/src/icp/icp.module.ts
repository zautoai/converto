import { Module } from '@nestjs/common';
import { IcpService } from './icp.service';
import { IcpController } from './icp.controller';
import { CommonModule } from 'src/common/common.module';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule, CommonModule],
  controllers: [IcpController],
  providers: [IcpService],
})

export class IcpModule { }
