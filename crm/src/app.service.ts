import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): any {
    return {
      code: 200,
      status: 'success',
      message: 'Welcome to convorto CRM',
    };
  }

  ping(): any {
    return {
      code: 200,
      status: 'success',
      message: 'pong',
    };
  }
}
