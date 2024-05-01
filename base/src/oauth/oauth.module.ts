import { Module } from '@nestjs/common';
import { OauthService } from './oauth.service';
import { OauthController } from './oauth.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { ExternalToolModule } from 'src/external-tool/external-tool.module';
import { OrgToolModule } from 'src/org-tool/org-tool.module';

@Module({
  imports: [
    PrismaModule,
    ExternalToolModule,
    OrgToolModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '7d' }, 
    }),
  ],
  providers: [OauthService],
  controllers: [OauthController],
  exports: [OauthService]
})
export class OauthModule {}
