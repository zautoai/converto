import { BadRequestException, HttpException, Injectable, Logger } from "@nestjs/common";

@Injectable()
export class BaseService {

    protected readonly logger;

    constructor()
    {
        this.logger = new Logger(this.constructor.name);
    }

    protected handleException(data: any)
    {
        if(data?.statusCode && data?.statusCode >= 400)
        {
            const status = data.statusCode;
            throw new HttpException({ message: data.message, error: data.error }, status);
        }
        else
        {
            return data;
        }
    }
}