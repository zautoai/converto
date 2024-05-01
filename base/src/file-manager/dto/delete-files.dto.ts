import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsNotEmpty, IsString } from "class-validator";

export class DeleteFilesDto{

    @ApiProperty()
    @IsNotEmpty({each:true})
    @IsString({ each: true })
    fileIds:string[];
}