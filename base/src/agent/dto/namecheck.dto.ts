import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";


export class NameCheckDto {

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    name: string;
}

export class NameAvailability {
    
    @ApiProperty()
    name: string;

    @ApiProperty()
    available: boolean;

    constructor(name: string, available: boolean) {
        this.name = name;
        this.available = available;
    }
}