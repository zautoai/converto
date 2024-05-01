import { PartialType } from "@nestjs/swagger";
import { CreateFieldDto } from "./create-fields.dto";

export class UpdateFiledDto extends PartialType(CreateFieldDto){

}