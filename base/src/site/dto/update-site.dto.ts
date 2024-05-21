import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateSiteDto } from './create-site.dto';
import { IsEnum, IsString, MaxLength } from 'class-validator';
import { SiteProcessStatus } from 'src/common/enums/enums';

export class UpdateSiteDto {
  @ApiProperty()
  @IsString()
  @MaxLength(500)
  url: string;
}
