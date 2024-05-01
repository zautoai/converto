import { ApiProperty } from "@nestjs/swagger";

export class ResponseDTO<Type>{
    
    @ApiProperty()
    total: number;


    @ApiProperty()
    data: Type[];
}