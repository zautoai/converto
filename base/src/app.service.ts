import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return `ZautoAI App is running!`;
  }

  getHealth() : any {
    return {
      status: true,
      heath: 'OK'
    }
  }
}
