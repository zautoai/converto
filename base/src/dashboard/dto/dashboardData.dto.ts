import { ApiProperty } from "@nestjs/swagger";
import { IsNumber } from "class-validator";

export class DashboardDataDto{

    @ApiProperty()
    @IsNumber()
    averageDealSize : number

    @ApiProperty()
    @IsNumber()
    leadConversionRate :number
    
    @ApiProperty()
    @IsNumber()
    leadRetentionRate  :number
    
    @ApiProperty()
    @IsNumber()
    marketingCost      :number
    
    @ApiProperty()
    @IsNumber()
    salesCost    :number
}