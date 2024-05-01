import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";


export class CreateOrgToolDto{

    @ApiProperty({required : true})
    @IsNotEmpty()
    @IsString()
    orgId:string;

    @ApiProperty({required : false})
    @IsOptional()
    @IsString()
    userId?:string;

    @ApiProperty({required : true})
    @IsNotEmpty()
    @IsString()
    toolId:string;

    @ApiProperty({required : true})
    @IsNotEmpty()
    @IsString()
    accessToken:string;

    @ApiProperty({required : false})
    @IsOptional()
    @IsString()
    refreshToken?:string;

    @ApiProperty({required : true})
    @IsNotEmpty()
    @IsNumber()
    expiresIn:number;

}