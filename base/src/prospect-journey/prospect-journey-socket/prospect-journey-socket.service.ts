import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { BaseService } from 'src/common/services/base.service';
import { ProspectjourneyService } from '../prospect-journey.service';

@Injectable()
export class ProspectJourneySocketService extends BaseService{
    
    private readonly connectedClients: Map<string, Socket> = new Map();

    constructor(private readonly prospectJourneyService: ProspectjourneyService){
        super()
    }

    async handleConnection(socket: Socket) {
        const clientId = socket.id;
        this.connectedClients.set(clientId, socket);
        this.logger.debug(`Client connected with id: ${clientId}`);      
        const orgId = this.getOrgId(socket);
        if(orgId)
        {
            const org = await this.getOrg(orgId);
            if(!org){
                this.disconnect(socket);
            }
            socket.on('prospectAction', (data) => this.handleProspectAction(socket, data))
        }
        else
        {
            this.disconnect(socket);
        }
    }

    handleDisconnect(client: Socket) {
        const clientId = client.id;
        this.connectedClients.delete(clientId);
        this.logger.debug(`Client disconnected with id: ${clientId}`);
    }

    disconnect(client:Socket)
    {
        const clientId = client.id;
        client.disconnect();
        this.connectedClients.delete(clientId);
        this.logger.debug(`Client disconnected with id: ${clientId}`);
    }

    getClients(): Map<string, Socket> {
        return this.connectedClients;
    }

    getClient(clientId: string): Socket {
        return this.connectedClients.get(clientId);
    }

    getClientsCount(): number {
        return this.connectedClients.size;
    }

    getOrgId(socket:Socket):string | null
    {
        const orgId = socket.handshake.query["orgId"] as string;
        return orgId || null;
    }

    async getOrg(orgId:string)
    {
        try
        {
            const prisma = await this.getPrismaMasterClient();
            return await prisma.organization.findFirst({where:{id:orgId}});
        }
        catch(err)
        {
            throw new Error(err.message);
        }
        finally
        {
            this.closeMasterConnection();
        }
    }

    async handleProspectAction(socket: Socket,data:any)
    {
        try
        {
            const orgId = this.getOrgId(socket);        
            await this.prospectJourneyService.create({orgId,data});
        }
        catch(err)
        {
            console.log(err.message);
            
        }
    }
}
