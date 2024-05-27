import { BadRequestException, Injectable } from "@nestjs/common";
import { TrackingDto } from "./dto/tracking.dto";
import { MessageMediaType } from "src/conversation/entities/conversation.enums";
import { ServiceParams } from "src/common/models/service-param.model";
import { BaseService } from "src/common/services/base.service";


@Injectable() 
export class TrackingService extends BaseService{

    constructor(){
        super();
    }

    async addTracking(serviceParams: ServiceParams<{convId:string,trackingDto:TrackingDto}>):Promise<void>
    {
        const { orgId,data:{convId, trackingDto} } = serviceParams;
        const { data } = trackingDto;
        const prisma = await this.getPrismaClient(orgId);
        try {
            const jsonData = JSON.parse(data);
            const activity = await prisma.zautoMessage.create({data:{
                activityJson:jsonData,
                convId,
                type:MessageMediaType.PAGE_ACTIVITY,
                role:'user'
            }});
        }
        catch (error)
        {
            throw new BadRequestException(error.message);
        }
        finally {
            await this.closeConnection(orgId);
        }
    }

}