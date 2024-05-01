import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { EnrichmentProviderName } from '../enrichment-provider.enum';

export class ContactEnrichmentDto {
  @ApiProperty({ required: true, description: 'Contact id' })
  @IsNotEmpty()
  @IsString()
  contactId: string;

  @ApiProperty({
    name: 'provider',
    required: false,
    description: 'Provider used to retrieve the information',
    enum: EnrichmentProviderName,
  })
  provider: EnrichmentProviderName;
}
