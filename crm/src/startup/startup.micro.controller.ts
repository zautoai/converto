import { Controller } from "@nestjs/common";
import { StartupService } from "./startup.service";
import { MessagePattern } from "@nestjs/microservices";

@Controller()
export class StartupMicroserviceController {
    constructor(private startupService: StartupService) { }

    @MessagePattern({ cmd: 'SYNC_ORGANIZATIONS' })
    async syncOrganizations() {
        return this.startupService.syncOrganizations();
    }
}