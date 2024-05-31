import { Logger } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { ProspectJourneySocketService } from './prospect-journey-socket.service';

@WebSocketGateway(8080, {
    cors: { origin: '*' }
})

export class ProspectJourneySocketGateway implements OnGatewayConnection, OnGatewayDisconnect {

    constructor(private readonly prospectJourneySocketService: ProspectJourneySocketService) { }

    @WebSocketServer()
    private server: Socket;

    handleConnection(client: Socket, ...args: any[]) {
        this.prospectJourneySocketService.handleConnection(client);
    }

    handleDisconnect(client: Socket) {
        this.prospectJourneySocketService.handleDisconnect(client);
    }

}
