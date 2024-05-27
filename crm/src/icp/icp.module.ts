import { Module } from '@nestjs/common';
import { IcpService } from './icp.service';
import { IcpController } from './icp.controller';
import { CommonModule } from 'src/common/common.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { IcpMicroController } from './icp.micro.controller';

@Module({
  imports: [PrismaModule, CommonModule],
  controllers: [IcpController, IcpMicroController],
  providers: [IcpService],
})

export class IcpModule { }
