import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";
import { AuthType, HttpMethod } from "src/common/enums/enums";



export class CreateExternalApiDto {

    orgId: string;

    @ApiProperty({ required: true })
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    username?: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    password?: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    header?: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    token?: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    url: string;

    @ApiProperty({ enum: HttpMethod })
    @IsNotEmpty()
    @IsString()
    method: HttpMethod = HttpMethod.POST;

    @ApiProperty({ enum: AuthType })
    @IsNotEmpty()
    @IsString()
    authType: AuthType = AuthType.NONE;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    description: string;

}