import { Controller } from '@nestjs/common';
import { CustomFieldsService } from './custom-fields.service';

@Controller('custom-fields')
export class CustomFieldsController {
  constructor(private readonly customFieldsService: CustomFieldsService) {}
}
