import { PartialType } from '@nestjs/mapped-types';
import { CreateOrgAccountDto } from './create-account.dto';

export class UpdateOrgAccountDto extends PartialType(CreateOrgAccountDto) {
    
}
