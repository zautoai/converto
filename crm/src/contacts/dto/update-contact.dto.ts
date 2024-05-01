import { ApiProperty, PartialType } from "@nestjs/swagger";
import { CreateContactDto } from "./create-contacts.dto";
import { IsOptional } from "class-validator";

export class UpdateContactDto extends PartialType(CreateContactDto) {

  @ApiProperty({ required: false, description: 'First name of the contact' })
  @IsOptional()
  tags: string[];
  
}
