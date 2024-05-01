import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsUrl } from "class-validator";

export class CreateDemandGenDto {

    @ApiProperty({required:true})
    @IsString()
    @IsNotEmpty()
    orgId:string;

    @ApiProperty({required:true})
    @IsString()
    @IsNotEmpty()
    @IsUrl()
    url:string;
}
