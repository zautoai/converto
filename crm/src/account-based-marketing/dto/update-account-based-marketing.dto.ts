import { PartialType } from '@nestjs/swagger';
import { CreateAccountBasedMarketingDto } from './create-account-based-marketing.dto';

export class UpdateAccountBasedMarketingDto extends PartialType(CreateAccountBasedMarketingDto) {}
