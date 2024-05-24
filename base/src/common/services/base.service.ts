import { BadRequestException, HttpException, Injectable, Logger } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { PrismaClientManager } from "src/prisma/prisma-client-manager.service";
import { DEFAULT_SCHEMA_NAME } from "../constants/system.constants";

@Injectable()
export class BaseService {

    protected readonly logger: Logger;
    private readonly prismaClientManager: PrismaClientManager;

    constructor()
    {
        this.logger = new Logger(this.constructor.name);
        this.prismaClientManager = new PrismaClientManager();
    }

    protected async getPrismaClient(OrgId:string):Promise<PrismaClient>
    {
        return await this.prismaClientManager.getClient(OrgId);
    }

    protected async getPrismaMasterClient():Promise<PrismaClient>
    {
        return await this.prismaClientManager.getClient(DEFAULT_SCHEMA_NAME);
    }

    protected async closeConnection(orgId:string)
    {
        await this.prismaClientManager.disconnectClient(orgId);
    }

    protected async closeMasterConnection()
    {
        await this.prismaClientManager.disconnectClient(DEFAULT_SCHEMA_NAME);
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