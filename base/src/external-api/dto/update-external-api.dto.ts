import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";
import { AuthType, HttpMethod } from "src/common/enums/enums";

export class UpdateExternalApiDto {

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    username?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    password?: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    header?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    token?: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    url?: string;



    @ApiProperty({ enum: HttpMethod })
    @IsOptional()
    @IsString()
    method?: HttpMethod = HttpMethod.POST;

    @ApiProperty({ enum: AuthType, required: false })
    @IsOptional()
    authType?: AuthType;

    @ApiProperty()
    @IsOptional()
    @IsString()
    description?: string;
}
