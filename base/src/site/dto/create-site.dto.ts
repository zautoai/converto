import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsNumber, IsString, MaxLength } from "class-validator";
import { SiteProcessStatus } from "src/common/enums/enums";

export class CreateSiteDto {

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MaxLength(500)
  url: string;
}
