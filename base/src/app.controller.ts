import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('health')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello() {
    return { status: 'OK' };
  }

  @Get('api')
  getHealth(): any {
    return this.appService.getHealth();
  }
}
