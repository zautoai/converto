import { Module } from '@nestjs/common';
import { ChromaDBService } from './chroma-dbservice/chroma-db.service';
import { CommonModule } from 'src/common/common.module';


@Module({
  imports: [CommonModule],
  providers: [ChromaDBService],
  exports: [ChromaDBService],
})
export class ChromaModule {}
