import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { RolesModule } from 'src/roles/roles.module';
import { MulterModule } from '@nestjs/platform-express';
import { CommonModule } from 'src/common/common.module';
import { OrgUsersController } from './organizarion-users.controller';
import { AccountModule } from 'src/account/account.module';

@Module({
  imports: [
    PrismaModule, 
    RolesModule,
    CommonModule,
    MulterModule.register(),
    AccountModule
  ],
  controllers: [UsersController, OrgUsersController],
  providers: [UsersService],
  exports: [UsersService]
})
export class UsersModule {}
