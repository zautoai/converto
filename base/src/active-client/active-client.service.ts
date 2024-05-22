import { Injectable } from "@nestjs/common";
import { CreateActiveClientDto } from "./dto/create-client.dto";
import { BaseService } from "src/common/services/base.service";
import { ServiceParams } from "src/common/models/service-param.model";

@Injectable()
export class ActiveClientService extends BaseService{


    constructor() {
        super();
    }

    async create(serviceParams: ServiceParams<CreateActiveClientDto>) {
        const { orgId ,data: activeClient } = serviceParams;
        const prisma = await this.getPrismaClient(orgId);
        const client = await prisma.activeClient.findUnique({where: {userId: activeClient.userId}})
        if(client) {
            return await prisma.activeClient.update({data: activeClient, where:{userId: activeClient.userId}});
        } else {
            return await prisma.activeClient.create({data: activeClient});
        }
    }

    async findOne(orgId: string,userId: string) {
        const prisma = await this.getPrismaClient(orgId);
        return await prisma.activeClient.findUnique({where: {userId}});
    }

    async findAll(orgId: string) {
        const prisma = await this.getPrismaClient(orgId);
        return await prisma.activeClient.findMany();
    }

    async findByUser(orgId: string,userId: string) {
        const prisma = await this.getPrismaClient(orgId);
        return await prisma.activeClient.findUnique({where: {userId}});
    }

    async findByClient(orgId: string,clientId: string) {
        const prisma = await this.getPrismaClient(orgId);
        return await prisma.activeClient.findUnique({where: {clientId}, include: {user: {
            select: {id: true, name:true, imgUrl: true}
        }}});
    }

    async deleteByClient(orgId: string,clientId: string) {
        const prisma = await this.getPrismaClient(orgId);
        try {
            return await prisma.activeClient.delete({where: {clientId}});
        }
        catch(error) {
            console.log(error)
        }
    }
}