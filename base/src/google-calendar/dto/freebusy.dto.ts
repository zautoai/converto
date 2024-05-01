import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsNotEmpty, IsString } from "class-validator";


export class FreeBusyItemDto {
    @ApiProperty({required:true})
    @IsString()
    @IsNotEmpty()
    id: string;
  }

export class FreeBusyRequestDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    timeMin: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    timeMax: string;

    // @ApiProperty()
    // @IsString()
    // @IsNotEmpty()
    // timeZone: string;

    @ApiProperty({ type: [FreeBusyItemDto] })
    @IsArray()
    items: FreeBusyItemDto[];
}