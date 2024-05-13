import { Module } from '@nestjs/common';
import { WebClientService } from './services/web-client.service';
import { HttpModule } from '@nestjs/axios';
import { JwtTokenService } from './services/jwt-token.service';
import { JwtModule } from '@nestjs/jwt';
import { MicroservicesModule } from 'src/microservices/microservices.module';
import { MappingService } from './services/mapping.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    MicroservicesModule,
    HttpModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '3d' },
    }),
  ],
  controllers: [],
  providers: [
    WebClientService,
    JwtTokenService,
    MappingService
  ],
  exports: [
    WebClientService, 
    JwtTokenService,
    MicroservicesModule,
    MappingService
  ],
})
export class CommonModule {}
