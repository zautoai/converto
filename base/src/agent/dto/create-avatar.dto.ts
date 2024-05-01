import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";


export class CreateAvatarDto {

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    displayName: string; 

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    companyName: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    companySite: string;

}