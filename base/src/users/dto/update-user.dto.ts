import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Exclude } from 'class-transformer';

export class UpdateUserDto {

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    @IsOptional()
    name: string;

    @ApiProperty()
    @IsInt()
    @IsNotEmpty()
    @IsOptional()
    roleId?: string;
    
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    @IsOptional()
    password?: string;

}
