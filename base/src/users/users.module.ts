import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { RolesModule } from 'src/roles/roles.module';
import { MulterModule } from '@nestjs/platform-express';
import { CommonModule } from 'src/common/common.module';
import { OrganizationsModule } from 'src/organizations/organizations.module';

@Module({
  imports: [
    PrismaModule,
    RolesModule,
    CommonModule,
    MulterModule.register(),
    OrganizationsModule
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService]
})
export class UsersModule { }
