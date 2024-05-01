import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNumber, IsString } from "class-validator";

export class Campaign{

    @ApiProperty({required:true})
    @IsNumber()
    id: string;

    @ApiProperty({required:true})
    @IsNumber()
    orgId?: string;

    @ApiProperty({required:true})
    @IsNumber()
    agentId:number;

    @ApiProperty({required:true})
    @IsString()
    title:string;

    @ApiProperty({required:true})
    @IsString()
    description:string;

    @ApiProperty({required:false})
    @IsString()
    status?:string;

    @ApiProperty()
    @IsBoolean()
    isZauto: boolean = true;

    @ApiProperty()
    @IsString()
    idParam: string;

    @ApiProperty()
    @IsString()
    idValue: string;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    modifiedAt: Date;

}