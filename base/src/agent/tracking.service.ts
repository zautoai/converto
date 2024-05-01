import { BadRequestException, Injectable } from "@nestjs/common";
import { TrackingDto } from "./dto/tracking.dto";
import { PrismaService } from "src/prisma/prisma.service";
import { MessageMediaType } from "src/conversation/entities/conversation.enums";


@Injectable() 
export class TrackingService {

    constructor(
        private prisma: PrismaService
    ){}

    async addTracking(agentId:string, convId:string,trackingDto:TrackingDto):Promise<void>
    {
        const { data } = trackingDto;
        try {
            const jsonData = JSON.parse(data);

            const agent = await this.prisma.agent.findUnique({where:{id:agentId}});
            if(!agent) throw new BadRequestException('Agent not found');
            const activity = await this.prisma.zautoMessage.create({data:{
                activityJson:jsonData,
                orgId:agent.orgId,
                agentId,
                convId,
                type:MessageMediaType.PAGE_ACTIVITY,
                role:'user'
            }});
            return null;
        }
        catch (error)
        {
            throw new BadRequestException(error);
        }
    }

}