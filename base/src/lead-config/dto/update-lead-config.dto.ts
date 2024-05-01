import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsEmail, IsMobilePhone, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class UpdateLeadConfigDto { 
    @ApiProperty()
    @IsNumber()
    @IsOptional()
    agentId: string;

    @ApiProperty()
    @IsBoolean()
    @IsOptional()
    name?: boolean = false;

    @ApiProperty()
    @IsBoolean()
    @IsOptional()
    email?: boolean = false;

    @ApiProperty()
    @IsBoolean()
    @IsOptional()
    mobile?: boolean = false;

    @ApiProperty()
    @IsBoolean()
    @IsOptional()
    whatsapp?: boolean = false;
}
