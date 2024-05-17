import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { RolesModule } from './roles/roles.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { CommonModule } from './common/common.module';
import { LoggingMiddleware } from './common/middlewares/logging. middleware';
import { OrganizationsModule } from './organizations/organizations.module';
import { AgentModule } from './agent/agent.module';
import { SiteModule } from './site/site.module';
import { ChromaModule } from './chroma/chroma.module';
import { StartupModule } from './startup/startup.module';
import { WorkerModule } from './worker/worker.module';
import { LlmModule } from './llm/llm.module';
import { AgentPromptModule } from './agent-prompt/agent-prompt.module';
import { VisitorModule } from './visitor/visitor.module';
import { ConversationModule } from './conversation/conversation.module';
import { LeadModule } from './lead/lead.module';
import { RegistrationModule } from './registration/registration.module';

import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { LeadConfigModule } from './lead-config/lead-config.module';
import { PlatformModule } from './platform/platform.module';
import { OrgPlatformModule } from './org-platform/org-platform.module';
import { AssistantsModule } from './assistants/assistants.module';
import { CampaignModule } from './campaign/campaign.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { StageModule } from './stage/stage.module';
import { HelpersModule } from './helpers/helpers.module';
import { BullModule } from '@nestjs/bull';
import { SocketModule } from './socket/socket.module';
import { ActiveClientModule } from './active-client/active-client.module';
import { SubscriptionPlanModule } from './subscription-plan/subscription-plan.module';
import { AccountModule } from './account/account.module';
import { OrgSmtpconfigModule } from './org-smtpconfig/org-smtpconfig.module';
import { CallToActionModule } from './call-to-action/call-to-action.module';
import { AvailabilityScheduleModule } from './availability-schedule/availability-schedule.module';
import { FileManagerModule } from './file-manager/file-manager.module';
import { LeadCategoryModule } from './lead-category/lead-category.module';
import { PromptTemplateModule } from './prompt-template/prompt-template.module';
import { DemandGenModule } from './demand-gen/demand-gen.module';
import { SecureExchangeModule } from './secure-exchange/secure-exchange.module';
import { MicroservicesModule } from './microservices/microservices.module';
import { ContactsModule } from './contacts/contacts.module';
import { FormBuilderModule } from './form-builder/form-builder.module';
import { AccountsModule } from './accounts/accounts.module';
import { AccountBasedMaretingModule } from './account-based-mareting/account-based-mareting.module';
import { EnrichmentModule } from './enrichment/enrichment.module';
import { ExternalCrmModule } from './external-crm/external-crm.module';
import { CalendarModule } from './calendar/calendar.module';
import { SchemaManagerModule } from './schema-manager/schema-manager.module';

@Module({
  imports: [
    PrismaModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath:
        process.env.NODE_ENV === 'production'
          ? undefined
          : ['.env.dev', '.env'],
    }),
    SchemaManagerModule,
    RolesModule,
    UsersModule,
    AuthModule,
    CommonModule,
    OrganizationsModule,
    AgentModule,
    SiteModule,
    ChromaModule,
    StartupModule,
    WorkerModule,
    LlmModule,
    AgentPromptModule,
    VisitorModule,
    ConversationModule,
    LeadModule,
    RegistrationModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public/assets/bot'),
      serveRoot: '/assets',
    }),
    LeadConfigModule,
    PlatformModule,
    OrgPlatformModule,
    AssistantsModule,
    CampaignModule,
    DashboardModule,
    StageModule,
    HelpersModule,
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_IP,
        port: parseInt(process.env.REDIS_PORT, 10) || 6379,
        password: process.env.REDIS_PASSWORD,
      },
    }),
    SocketModule,
    ActiveClientModule,
    SubscriptionPlanModule,
    AccountModule,
    OrgSmtpconfigModule,
    CallToActionModule,
    AvailabilityScheduleModule,
    FileManagerModule,
    LeadCategoryModule,
    PromptTemplateModule,
    DemandGenModule,
    SecureExchangeModule,
    MicroservicesModule,
    ContactsModule,
    FormBuilderModule,
    AccountsModule,
    AccountBasedMaretingModule,
    EnrichmentModule,
    ExternalCrmModule,
    CalendarModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).forRoutes('*'); // Apply the middleware to all routes
  }
}
