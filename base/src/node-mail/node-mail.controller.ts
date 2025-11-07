import { Body, Controller, Post } from '@nestjs/common';
import { NodeMailService } from './node-mail.service';
import { ContactRequestDto } from './dto/contact-request.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('node-mail')
@Controller('public')
export class NodeMailController {
  constructor(private readonly nodeMailService: NodeMailService) {}

  @Post('contact')
  @ApiOperation({ summary: 'Submit the  website contact form (no auth required)' })
  @ApiResponse({ status: 201, description: 'Contact message accepted  and email queued/sent.' })
  async submit(@Body() dto: ContactRequestDto) {
    return await this.nodeMailService.submit(dto);
  }
}
