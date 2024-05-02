import { Inject, Injectable, Logger } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";

@Injectable()
export class SchemaManagerService {

    private logger = new Logger(SchemaManagerService.name); 
    constructor(@Inject('CRM_SERVICE') private readonly CRMClient: ClientProxy) { }

    async create(orgId: string,name:string) {
        try
        {
            return this.CRMClient.send({cmd: 'CREATE_SCHEMA'}, {orgId,name}).toPromise();
        }
        catch (error)
        {
            this.logger.error(`Error while creating schema: ${error.message}`);
            throw error;
        }
    }

    async delete(orgId: string) {
        try
        {
            return this.CRMClient.send({cmd: 'DELETE_SCHEMA'}, {orgId, name}).toPromise();
        }
        catch (error)
        {
            this.logger.error(`Error while deleting schema: ${error.message}`);
            throw error;
        }
    }
}