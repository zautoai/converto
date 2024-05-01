import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ExchangeTokenDto {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsString()
  secretKey: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsString()
  orgId: string;
}
