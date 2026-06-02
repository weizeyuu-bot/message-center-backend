import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth() {
    return {
      ok: true,
      service: 'message-center-backend',
      timestamp: new Date().toISOString(),
    };
  }
}
