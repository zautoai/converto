import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";


export class CreateProviderDto{

    @ApiProperty({required: true})
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty({required: true})
    @IsNotEmpty()
    @IsString()
    authUrl: string;

    @ApiProperty({required: true})
    @IsNotEmpty()
    @IsString()
    tokenUrl: string;
    @ApiProperty({required: true})
    @IsNotEmpty()
    @IsString()
    profileUrl: string;

    @ApiProperty({required: true})
    @IsNotEmpty()
    @IsString()
    clientId: string;

    @ApiProperty({required: true})
    @IsNotEmpty()
    @IsString()
    clientSecret: string;

    @ApiProperty({required: true})
    @IsNotEmpty()
    @IsString()
    redirectUri: string;

    @ApiProperty({required: true})
    @IsNotEmpty()
    @IsString()
    scope: string;
}