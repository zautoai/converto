import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";
import { Transform, plainToClass } from 'class-transformer';


export class CreateRoleDto {
    @Transform(({ value }) => value)
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    name: string;
}
