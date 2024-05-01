import { Injectable } from "@nestjs/common";
import { CreateActiveClientDto } from "./dto/create-client.dto";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class ActiveClientService {


    constructor(private readonly prisma: PrismaService) {}

    async create(activeClient: CreateActiveClientDto) {
        const client = await this.prisma.activeClient.findUnique({where: {userId: activeClient.userId}})
        if(client) {
            return await this.prisma.activeClient.update({data: activeClient, where:{userId: activeClient.userId}});
        } else {
            return await this.prisma.activeClient.create({data: activeClient});
        }
    }

    async findOne(userId: string) {
        return await this.prisma.activeClient.findUnique({where: {userId}});
    }

    async findByOrg(orgId: string) {
        return await this.prisma.activeClient.findMany({where: {orgId}});
    }

    async findByUser(userId: string) {
        return await this.prisma.activeClient.findUnique({where: {userId}});
    }

    async findByClient(clientId: string) {
        return await this.prisma.activeClient.findUnique({where: {clientId}, include: {user: {
            select: {id: true, name:true, imgUrl: true}
        }}});
    }

    async deleteByClient(clientId: string) {
        try {
            return await this.prisma.activeClient.delete({where: {clientId}});
        }
        catch(error) {
            console.log(error)
        }
    }
}