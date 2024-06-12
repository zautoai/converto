import { PartialType } from '@nestjs/swagger';
import { CreateIcpDto } from './create-icp.dto';

export class UpdateIcpDto extends PartialType(CreateIcpDto) {}
