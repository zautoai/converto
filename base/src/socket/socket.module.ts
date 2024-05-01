import { Module } from '@nestjs/common';
import { SocketGateway } from './socket-gateway';
import { LlmModule } from 'src/llm/llm.module';
import { LeadModule } from 'src/lead/lead.module';
import { AgentModule } from 'src/agent/agent.module';
import { ConversationModule } from 'src/conversation/conversation.module';
import { VisitorModule } from 'src/visitor/visitor.module';
import { ActiveClientModule } from 'src/active-client/active-client.module';
import { JwtModule } from '@nestjs/jwt';
import { AccountModule } from 'src/account/account.module';
import { SiteModule } from 'src/site/site.module';
import { CrmKeyMapingModule } from 'src/crm-key-maping/crm-key-maping.module';

@Module({
    imports: [
        LlmModule,
        LeadModule,
        AgentModule,
        ConversationModule,
        VisitorModule,
        ActiveClientModule,
        CrmKeyMapingModule,
        JwtModule.register({
            secret: process.env.JWT_SECRET, // Use your secret or private key here
            signOptions: { expiresIn: '60s' },
        }),
        SiteModule,
        AccountModule
    ],
    providers: [SocketGateway],
    exports: [SocketGateway],
})
export class SocketModule {}
