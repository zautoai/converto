import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";


export class ScrapLinksDto {
    @ApiProperty()
    @IsNotEmpty()
    rootUrl: string;
}

export class ScrapMultipleDto {
    @ApiProperty()
    @IsNotEmpty()
    urls: string[];

}