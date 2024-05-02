import { PartialType } from '@nestjs/swagger';
import { CreateAccountBasedMaretingDto } from './create-account-based-mareting.dto';

export class UpdateAccountBasedMaretingDto extends PartialType(CreateAccountBasedMaretingDto) {}
