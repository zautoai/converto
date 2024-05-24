import { Module } from '@nestjs/common';
import { SocketGateway } from './socket-gateway';
import { LlmModule } from 'src/llm/llm.module';
import { AgentModule } from 'src/agent/agent.module';
import { ConversationModule } from 'src/conversation/conversation.module';
import { VisitorModule } from 'src/visitor/visitor.module';
import { ActiveClientModule } from 'src/active-client/active-client.module';
import { JwtModule } from '@nestjs/jwt';
import { SiteModule } from 'src/site/site.module';
import { ContactsModule } from 'src/contacts/contacts.module';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
    imports: [
        LlmModule,
        AgentModule,
        ConversationModule,
        ContactsModule,
        VisitorModule,
        ActiveClientModule,
        PrismaModule,
        JwtModule.register({
            secret: process.env.JWT_SECRET, // Use your secret or private key here
            signOptions: { expiresIn: '60s' },
        }),
        SiteModule,
    ],
    providers: [SocketGateway],
    exports: [SocketGateway],
})
export class SocketModule { }
