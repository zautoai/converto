import { Controller } from "@nestjs/common";
import { MessagePattern } from "@nestjs/microservices";
import { SchemaManagerService } from "./schema-manager.service";


@Controller('schema-manager')
export class SchemaManagerMicroserviceController {

    constructor(private readonly schemaManagerService: SchemaManagerService) {}

    @MessagePattern({cmd:"CREATE_SCHEMA"})
    async createSchema(data: any) {
        try
        {
            const rollback = () => {
                // this.schemaManagerService.delete(data.orgId);
            };
            return await this.schemaManagerService.create({orgId: data.orgId, name: data.name },rollback);
        }
        catch(error)
        {
            return error.response || error;
        }
    }

    @MessagePattern({cmd:"MIGRATE_SCHEMA"})
    async migrateSchema(data: any) {
        try
        {
            return await this.schemaManagerService.migrate(data.orgId);
        }
        catch(error)
        {
            return error.response || error;
        }
    }

    @MessagePattern({cmd:"DELETE_SCHEMA"})
    async deleteSchema(data: any) {
        try
        {
            return await this.schemaManagerService.delete(data.orgId);
        }
        catch(error)
        {
            return error.response || error;
        }
    }
}