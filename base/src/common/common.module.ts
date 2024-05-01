import { Module } from '@nestjs/common';
import { LoggingMiddleware } from './middlewares/logging. middleware';
import { HttpModule } from '@nestjs/axios';
import { WebClientService } from './services/web-client.service';
import { EmailService } from './services/email.service';
import { S3Service } from './services/s3.service';
import { StaticFileService } from './services/static.service';
import { FileUtilService } from './services/file-utility.service';
import { WebScraperService } from './services/web-scraper.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { IPTrackingService } from './services/iptracking.service';
import { HashingService } from './services/hashing.service';
import { SmtpService } from './services/smtp.service';
import { JwtModule } from '@nestjs/jwt';
import { JwtTokenService } from './services/jwt-token.service';

@Module({
  imports: [
    HttpModule,
    PrismaModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
  ],
  providers: [
    LoggingMiddleware,
    WebClientService,
    EmailService,
    S3Service,
    StaticFileService,
    FileUtilService,
    WebScraperService,
    IPTrackingService,
    HashingService,
    SmtpService,
    JwtTokenService,
  ],
  exports: [
    LoggingMiddleware,
    WebClientService,
    EmailService,
    S3Service,
    StaticFileService,
    FileUtilService,
    WebScraperService,
    IPTrackingService,
    HashingService,
    SmtpService,
    JwtTokenService,
  ],
})
export class CommonModule {}
