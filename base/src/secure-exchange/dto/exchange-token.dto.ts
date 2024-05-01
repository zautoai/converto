import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ExchangeTokenDto {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsString()
  secretKey: string;

  @ApiProperty({ required: true })
  @IsOptional()
  @IsString()
  orgId?: string;
}
