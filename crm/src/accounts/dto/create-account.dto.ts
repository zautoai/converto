import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsBoolean, IsEnum, IsNumber, IsOptional, IsString, IsEmail } from "class-validator";
import { accountType } from "../account.enum";

export class CreateAccountDto {

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    parentAccountId?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    photoUrl?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    accountName: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    industry?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    companySize?: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    annualRevenue?: number;

    @ApiProperty({ required: false, enum: accountType })
    @IsEnum(accountType)
    @IsOptional()
    accountType?: accountType = accountType.PROSPECT;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    website?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    domain?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    address?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    city?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    state?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    zip?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    country?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    phone?: string;

    @ApiProperty({ required: false })
    @IsEmail()
    @IsOptional()
    email?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    socialMedia?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    notes?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    source?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    status?: string;

    @ApiProperty({ required: false })
    @IsArray()
    @IsOptional()
    decisionMakers: string[]

    @ApiProperty({ required: false })
    @IsArray()
    @IsOptional()
    painPoints: string[]

    @ApiProperty({ required: false })
    @IsArray()
    @IsOptional()
    campaigns: string[]

    @ApiProperty({ required: false })
    @IsArray()
    @IsOptional()
    teamMembers: string[]

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    buyingStage: string

    @ApiProperty({ required: false })
    @IsBoolean()
    @IsOptional()
    isabm: boolean
}
