import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { OrgPlatformController } from './org-platform.controller';
import { OrgPlatformService } from './org-platform.service';
import { OrgPlatformOtherController } from './org-platform-other.controller';

@Module({
    imports:[PrismaModule],
    controllers:[OrgPlatformController,OrgPlatformOtherController],
    providers:[OrgPlatformService],
})
export class OrgPlatformModule {

}
