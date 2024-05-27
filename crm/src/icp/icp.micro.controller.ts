import { Controller } from "@nestjs/common";
import { IcpService } from "./icp.service";
import { MessagePattern } from "@nestjs/microservices";


@Controller()
export class IcpMicroController {

    constructor(
        private readonly icpService: IcpService
    ) { }

    @MessagePattern({ cmd: 'CREATE_ICP' })
    async createIcp(data: any) {
        try {
            return await this.icpService.create(data.orgId, data.icp);
        } catch (error) {
            return error.response || error
        }
    }

    @MessagePattern({ cmd: 'GET_ICPs' })
    async getIcps(data: any) {
        try {
            return await this.icpService.findAll(data.orgId);
        } catch (error) {
            return error.response || error
        }
    }

    @MessagePattern({ cmd: 'GET_ICP' })
    async getIcp(data: any) {
        try {
            return await this.icpService.findOne(data.orgId, data.id);
        } catch (error) {
            return error.response || error
        }
    }

    @MessagePattern({ cmd: 'UPDATE_ICP' })
    async updateIcp(data: any) {
        try {
            return await this.icpService.update(data.orgId, data.id, data.icp);
        } catch (error) {
            return error.response || error
        }
    }

    @MessagePattern({ cmd: 'DELETE_ICP' })
    async deleteIcp(data: any) {
        try {
            return await this.icpService.remove(data.orgId, data.id);
        } catch (error) {
            console.log(error);
            return error.response || error
        }
    }
}
