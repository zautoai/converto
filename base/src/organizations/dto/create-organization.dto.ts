import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateOrganizationDto {
    @Transform(({ value }) => value)
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    name: string;
}
