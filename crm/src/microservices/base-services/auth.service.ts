import { Inject, Injectable, Logger } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";

@Injectable()
export class AuthService {
  private logger = new Logger(AuthService.name);

  constructor(@Inject('BASE_SERVICE') private readonly BaseClient: ClientProxy) {}

  async verifyToken(token: string): Promise<any> {
    try
    {
        this.logger.log(`Verifying token ${token}`);
        return this.BaseClient.send({ cmd: 'VERIFY_TOKEN' }, token).toPromise();
    }
    catch (error)
    {
        this.logger.error(error);
        return null;
    }
  }

} 