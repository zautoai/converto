import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { LeadCategoryController } from './lead-category.controller';
import { LeadCategoryService } from './lead-category.service';

@Module({
    imports:[PrismaModule],
    controllers:[LeadCategoryController],
    providers:[LeadCategoryService],
    exports:[LeadCategoryService] 
})
export class LeadCategoryModule {}
