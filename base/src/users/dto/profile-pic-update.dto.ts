import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class UpdateProfilePicDto {

    @ApiProperty() 
    @IsString()
    @IsNotEmpty()
    imgUrl: string;
    
}