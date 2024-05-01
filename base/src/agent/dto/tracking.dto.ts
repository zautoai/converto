import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class TrackingDto{
    @ApiProperty({required:true})
    @IsNotEmpty()
    @IsString()
    data:string;
}