-- CreateEnum
CREATE TYPE "VerificationType" AS ENUM ('VERIFYEMAIL', 'FORGOTPASSWORD');

-- CreateEnum
CREATE TYPE "OrgAccountStatus" AS ENUM ('ACTIVE', 'EXPAIRED', 'PENDING');

-- CreateEnum
CREATE TYPE "ConversationType" AS ENUM ('CALL', 'CHAT');

-- CreateEnum
CREATE TYPE "SiteProcessStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "AgentStatus" AS ENUM ('TRAINING', 'TRAININGFAILED', 'ACTIVE', 'INACTIVE', 'DELETED');

-- CreateEnum
CREATE TYPE "BotPosition" AS ENUM ('BOTTOM_CENTER', 'BOTTOM_LEFT', 'BOTTOM_RIGHT');

-- CreateEnum
CREATE TYPE "ConversationStatus" AS ENUM ('ONLINE', 'OFFLINE');

-- CreateEnum
CREATE TYPE "MessageMediaType" AS ENUM ('TEXT', 'ACTIVITY', 'NAVIGATION', 'PAGE_ACTIVITY', 'ERROR', 'WARNING');

-- CreateEnum
CREATE TYPE "Sentimental" AS ENUM ('POSITIVE', 'NEGATIVE', 'NUTRAL');

-- CreateEnum
CREATE TYPE "Vote" AS ENUM ('UPVOTE', 'DOWNVOTE');

-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('REPORTING', 'CLOSEDWON', 'CLOSEDLOST');

-- CreateEnum
CREATE TYPE "CampaignStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "CTAType" AS ENUM ('CTA', 'NAVIGATOR', 'CALENDAR');

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modifiedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(50),
    "email" VARCHAR(50) NOT NULL,
    "password" VARCHAR(100) NOT NULL,
    "roleId" TEXT,
    "verified" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modifiedAt" TIMESTAMP(3) NOT NULL,
    "orgId" TEXT,
    "imgUrl" VARCHAR(300),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Verification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "token" VARCHAR(100) NOT NULL DEFAULT 'default',
    "type" "VerificationType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modifiedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(50) NOT NULL DEFAULT 'default',
    "siteUrl" TEXT,
    "emails" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modifiedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActiveClient" (
    "userId" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modifiedAt" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "SubscriptionPlan" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "type" VARCHAR(10) NOT NULL DEFAULT 'monthly',
    "description" TEXT NOT NULL,
    "agentsCount" INTEGER NOT NULL DEFAULT 1,
    "messageCount" INTEGER NOT NULL DEFAULT 0,
    "conversationCount" INTEGER NOT NULL DEFAULT 0,
    "sitesCount" INTEGER NOT NULL DEFAULT 0,
    "campaignCount" INTEGER NOT NULL DEFAULT 0,
    "userCount" INTEGER NOT NULL DEFAULT 0,
    "price" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modifiedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubscriptionPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrgAccount" (
    "orgId" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "status" "OrgAccountStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modifiedAt" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "Usage" (
    "orgId" TEXT NOT NULL,
    "month" VARCHAR(20) NOT NULL,
    "year" VARCHAR(10) NOT NULL,
    "inputToken" INTEGER NOT NULL DEFAULT 0,
    "ountputToken" INTEGER NOT NULL DEFAULT 0,
    "message" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modifiedAt" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "Agent" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "name" VARCHAR(100),
    "displayName" VARCHAR(50) NOT NULL,
    "usetools" BOOLEAN NOT NULL DEFAULT true,
    "role" VARCHAR(100),
    "companyName" VARCHAR(100) NOT NULL,
    "companyBusiness" TEXT,
    "companyValue" TEXT,
    "purpouse" TEXT,
    "leadInfo" TEXT,
    "conversationType" "ConversationType" NOT NULL DEFAULT 'CHAT',
    "logoUrl" TEXT,
    "welcomeMsg" TEXT,
    "llmModel" VARCHAR(150),
    "useAssistant" BOOLEAN NOT NULL DEFAULT false,
    "assistantId" VARCHAR(100),
    "siteObjUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modifiedAt" TIMESTAMP(3) NOT NULL,
    "status" "AgentStatus" NOT NULL DEFAULT 'TRAINING',
    "styles" TEXT,
    "autoAnalysis" BOOLEAN NOT NULL DEFAULT false,
    "wakeupTime" DOUBLE PRECISION DEFAULT 5000,
    "position" "BotPosition" DEFAULT 'BOTTOM_RIGHT',
    "starters" TEXT,

    CONSTRAINT "Agent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentFile" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "fileId" VARCHAR(150),
    "path" TEXT,
    "fileName" TEXT,
    "filePath" TEXT,
    "size" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modifiedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgentFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeadConfig" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "orgId" TEXT,
    "name" BOOLEAN NOT NULL DEFAULT false,
    "email" BOOLEAN NOT NULL DEFAULT false,
    "mobile" BOOLEAN NOT NULL DEFAULT false,
    "whatsapp" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modifiedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeadConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Site" (
    "id" TEXT NOT NULL,
    "url" VARCHAR(500) NOT NULL,
    "status" "SiteProcessStatus" DEFAULT 'IN_PROGRESS',
    "info" TEXT,
    "greeting" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modifiedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Site_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentPrompt" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "orgId" TEXT,
    "templateId" TEXT,
    "type" VARCHAR(50) NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modifiedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgentPrompt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Visitor" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "orgId" TEXT,
    "userAgent" TEXT NOT NULL,
    "infoJson" TEXT NOT NULL,
    "trackingInfo" TEXT,
    "ipAddress" VARCHAR(40),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modifiedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Visitor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Visit" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "visitorId" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 1,
    "source" VARCHAR(50) NOT NULL DEFAULT 'site',
    "campaignId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modifiedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Visit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Conversation" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "visitorId" TEXT NOT NULL,
    "campaignId" VARCHAR(200),
    "visitId" TEXT NOT NULL,
    "type" "ConversationType" NOT NULL,
    "threadId" VARCHAR(150),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modifiedAt" TIMESTAMP(3) NOT NULL,
    "summary" TEXT,
    "summaryUpdatedAt" TIMESTAMP,
    "sentimental" "Sentimental",
    "suggestions" TEXT,
    "taskList" TEXT,
    "potentialLevel" TEXT,
    "status" "ConversationStatus" NOT NULL DEFAULT 'OFFLINE',
    "socketId" VARCHAR(200),
    "assigneeId" TEXT,
    "aiSuspended" BOOLEAN NOT NULL DEFAULT false,
    "isEnded" BOOLEAN NOT NULL DEFAULT false,
    "isValid" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ZautoMessage" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "convId" TEXT NOT NULL,
    "role" VARCHAR(20) NOT NULL,
    "content" TEXT,
    "activityJson" JSONB,
    "type" "MessageMediaType" NOT NULL DEFAULT 'TEXT',
    "url" VARCHAR(500),
    "vote" "Vote",
    "feedback" VARCHAR(256),
    "sentimental" "Sentimental" NOT NULL DEFAULT 'NUTRAL',
    "sentByHuman" BOOLEAN NOT NULL DEFAULT false,
    "sentById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modifiedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ZautoMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "convId" TEXT,
    "agentId" TEXT,
    "orgId" TEXT,
    "name" VARCHAR(50),
    "email" VARCHAR(50),
    "mobile" VARCHAR(15),
    "whatsapp" VARCHAR(15),
    "info" TEXT,
    "crm_id" VARCHAR(100),
    "crmContactid" TEXT,
    "status" "LeadStatus" NOT NULL DEFAULT 'REPORTING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modifiedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeadCategory" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modifiedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeadCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeadCategoryMap" (
    "orgId" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modifiedAt" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "Campaign" (
    "id" TEXT NOT NULL,
    "hash" TEXT,
    "title" VARCHAR(50) NOT NULL,
    "description" TEXT NOT NULL,
    "source" TEXT,
    "url" TEXT,
    "isZauto" BOOLEAN NOT NULL DEFAULT true,
    "idParam" TEXT,
    "idValue" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isPaied" BOOLEAN NOT NULL DEFAULT false,
    "status" "CampaignStatus" NOT NULL DEFAULT 'ACTIVE',
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modifiedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT,

    CONSTRAINT "Campaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Stage" (
    "id" TEXT NOT NULL,
    "agentId" TEXT,
    "orgId" TEXT,
    "name" VARCHAR(100) NOT NULL,
    "instruction" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "canEdit" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modifiedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Stage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OpenAIAssistant" (
    "id" TEXT NOT NULL,
    "assistantId" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(256) NOT NULL,
    "instructions" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modifiedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OpenAIAssistant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrgSMTPConfig" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "host" TEXT NOT NULL,
    "port" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "user" TEXT NOT NULL,
    "pass" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modifiedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrgSMTPConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CallToAction" (
    "id" TEXT NOT NULL,
    "agentId" TEXT,
    "orgId" TEXT,
    "name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(256) NOT NULL,
    "link" TEXT,
    "type" "CTAType" DEFAULT 'NAVIGATOR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modifiedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CallToAction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AvailabilitySchedule" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "availableDays" TEXT NOT NULL,
    "eventDuration" INTEGER NOT NULL,
    "calendarId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modifiedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AvailabilitySchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "availableHours" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "start" TEXT NOT NULL,
    "end" TEXT NOT NULL,
    "scheduleId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modifiedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "availableHours_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExternalToolCredential" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "tokeType" TEXT,
    "refreshToken" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "expiresIn" INTEGER NOT NULL,
    "toolName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modifiedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExternalToolCredential_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Users_roleId_fkey" ON "User"("roleId");

-- CreateIndex
CREATE INDEX "userId_Verification_fkey" ON "Verification"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ActiveClient_userId_key" ON "ActiveClient"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ActiveClient_clientId_key" ON "ActiveClient"("clientId");

-- CreateIndex
CREATE INDEX "UserId_ActiveClient_fkey" ON "ActiveClient"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ActiveClient_userId_clientId_key" ON "ActiveClient"("userId", "clientId");

-- CreateIndex
CREATE UNIQUE INDEX "SubscriptionPlan_name_key" ON "SubscriptionPlan"("name");

-- CreateIndex
CREATE UNIQUE INDEX "OrgAccount_orgId_key" ON "OrgAccount"("orgId");

-- CreateIndex
CREATE INDEX "OrgId_OrgAccount_fkey" ON "OrgAccount"("orgId");

-- CreateIndex
CREATE INDEX "subscriptionId_OrgAccount_fkey" ON "OrgAccount"("subscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "OrgAccount_orgId_subscriptionId_key" ON "OrgAccount"("orgId", "subscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "Usage_orgId_key" ON "Usage"("orgId");

-- CreateIndex
CREATE INDEX "OrgAccount_orgId_fkey" ON "Usage"("orgId");

-- CreateIndex
CREATE UNIQUE INDEX "Usage_orgId_month_year_key" ON "Usage"("orgId", "month", "year");

-- CreateIndex
CREATE UNIQUE INDEX "Agent_name_key" ON "Agent"("name");

-- CreateIndex
CREATE INDEX "OrgId_agent_fkey" ON "Agent"("orgId");

-- CreateIndex
CREATE UNIQUE INDEX "Agent_name_orgId_key" ON "Agent"("name", "orgId");

-- CreateIndex
CREATE INDEX "AgentId_agentFile_fkey" ON "AgentFile"("agentId");

-- CreateIndex
CREATE INDEX "OrgId_leadconfig_fkey" ON "LeadConfig"("orgId");

-- CreateIndex
CREATE INDEX "AgentId_LeadConfig_fkey" ON "LeadConfig"("agentId");

-- CreateIndex
CREATE INDEX "Agentprompt_orgId_fkey" ON "AgentPrompt"("orgId");

-- CreateIndex
CREATE INDEX "OrgId_visitor_fkey" ON "Visitor"("orgId");

-- CreateIndex
CREATE INDEX "AgentId_visitor_fkey" ON "Visitor"("agentId");

-- CreateIndex
CREATE INDEX "Visitor_orgId_fkey" ON "Visit"("orgId");

-- CreateIndex
CREATE INDEX "Visitor_agentId_fkey" ON "Visit"("agentId");

-- CreateIndex
CREATE INDEX "Visitor_visitorId_fkey" ON "Visit"("visitorId");

-- CreateIndex
CREATE INDEX "Visitor_campaignId_fkey" ON "Visit"("campaignId");

-- CreateIndex
CREATE INDEX "Visitor_source_key" ON "Visit"("source");

-- CreateIndex
CREATE UNIQUE INDEX "Conversation_visitId_key" ON "Conversation"("visitId");

-- CreateIndex
CREATE UNIQUE INDEX "Conversation_socketId_key" ON "Conversation"("socketId");

-- CreateIndex
CREATE INDEX "assignee_Conversation_fkey" ON "Conversation"("assigneeId");

-- CreateIndex
CREATE INDEX "orgId_Conversation_fkey" ON "Conversation"("orgId");

-- CreateIndex
CREATE INDEX "agentId_Conversation_fkey" ON "Conversation"("agentId");

-- CreateIndex
CREATE INDEX "campaignId_Conversation_fkey" ON "Conversation"("campaignId");

-- CreateIndex
CREATE INDEX "visitorId_Conversation_fkey" ON "Conversation"("visitorId");

-- CreateIndex
CREATE INDEX "visitId_Conversation_fkey" ON "Conversation"("visitId");

-- CreateIndex
CREATE INDEX "orgId_ZautoMessage_fkey" ON "ZautoMessage"("orgId");

-- CreateIndex
CREATE INDEX "convId_ZautoMessage_fkey" ON "ZautoMessage"("convId");

-- CreateIndex
CREATE INDEX "sentById_ZautoMessage_fkey" ON "ZautoMessage"("sentById");

-- CreateIndex
CREATE UNIQUE INDEX "Lead_convId_key" ON "Lead"("convId");

-- CreateIndex
CREATE UNIQUE INDEX "Lead_crmContactid_key" ON "Lead"("crmContactid");

-- CreateIndex
CREATE INDEX "orgId_Lead_fkey" ON "Lead"("orgId");

-- CreateIndex
CREATE INDEX "convId_Lead_fkey" ON "Lead"("convId");

-- CreateIndex
CREATE INDEX "agentId_Lead_fkey" ON "Lead"("agentId");

-- CreateIndex
CREATE INDEX "orgId_LeadCategory_fkey" ON "LeadCategory"("orgId");

-- CreateIndex
CREATE UNIQUE INDEX "LeadCategory_orgId_name_key" ON "LeadCategory"("orgId", "name");

-- CreateIndex
CREATE INDEX "orgId_LeadCategoryMap_fkey" ON "LeadCategoryMap"("orgId");

-- CreateIndex
CREATE INDEX "leadId_LeadCategoryMap_fkey" ON "LeadCategoryMap"("leadId");

-- CreateIndex
CREATE INDEX "categoryId_LeadCategoryMap_fkey" ON "LeadCategoryMap"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "LeadCategoryMap_orgId_leadId_categoryId_key" ON "LeadCategoryMap"("orgId", "leadId", "categoryId");

-- CreateIndex
CREATE INDEX "agentId_Stage_fkey" ON "Stage"("agentId");

-- CreateIndex
CREATE INDEX "orgId_Stage_fkey" ON "Stage"("orgId");

-- CreateIndex
CREATE UNIQUE INDEX "Stage_agentId_name_key" ON "Stage"("agentId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Stage_agentId_sequence_key" ON "Stage"("agentId", "sequence");

-- CreateIndex
CREATE UNIQUE INDEX "OpenAIAssistant_assistantId_key" ON "OpenAIAssistant"("assistantId");

-- CreateIndex
CREATE UNIQUE INDEX "OpenAIAssistant_name_key" ON "OpenAIAssistant"("name");

-- CreateIndex
CREATE INDEX "SMTPConfig_orgId_fkey" ON "OrgSMTPConfig"("orgId");

-- CreateIndex
CREATE INDEX "Cta_agentId_fkey" ON "CallToAction"("agentId");

-- CreateIndex
CREATE INDEX "Cta_orgId_fkey" ON "CallToAction"("orgId");

-- CreateIndex
CREATE UNIQUE INDEX "CallToAction_agentId_name_key" ON "CallToAction"("agentId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "AvailabilitySchedule_orgId_key" ON "AvailabilitySchedule"("orgId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActiveClient" ADD CONSTRAINT "ActiveClient_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgAccount" ADD CONSTRAINT "OrgAccount_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgAccount" ADD CONSTRAINT "OrgAccount_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "SubscriptionPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Agent" ADD CONSTRAINT "Agent_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentFile" ADD CONSTRAINT "AgentFile_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadConfig" ADD CONSTRAINT "LeadConfig_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadConfig" ADD CONSTRAINT "LeadConfig_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentPrompt" ADD CONSTRAINT "AgentPrompt_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentPrompt" ADD CONSTRAINT "AgentPrompt_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Visitor" ADD CONSTRAINT "Visitor_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Visitor" ADD CONSTRAINT "Visitor_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Visit" ADD CONSTRAINT "Visit_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Visit" ADD CONSTRAINT "Visit_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Visit" ADD CONSTRAINT "Visit_visitorId_fkey" FOREIGN KEY ("visitorId") REFERENCES "Visitor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Visit" ADD CONSTRAINT "Visit_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_visitorId_fkey" FOREIGN KEY ("visitorId") REFERENCES "Visitor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_visitId_fkey" FOREIGN KEY ("visitId") REFERENCES "Visit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ZautoMessage" ADD CONSTRAINT "ZautoMessage_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ZautoMessage" ADD CONSTRAINT "ZautoMessage_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ZautoMessage" ADD CONSTRAINT "ZautoMessage_convId_fkey" FOREIGN KEY ("convId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ZautoMessage" ADD CONSTRAINT "ZautoMessage_sentById_fkey" FOREIGN KEY ("sentById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_convId_fkey" FOREIGN KEY ("convId") REFERENCES "Conversation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadCategory" ADD CONSTRAINT "LeadCategory_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadCategoryMap" ADD CONSTRAINT "LeadCategoryMap_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadCategoryMap" ADD CONSTRAINT "LeadCategoryMap_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadCategoryMap" ADD CONSTRAINT "LeadCategoryMap_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "LeadCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stage" ADD CONSTRAINT "Stage_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stage" ADD CONSTRAINT "Stage_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CallToAction" ADD CONSTRAINT "CallToAction_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CallToAction" ADD CONSTRAINT "CallToAction_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AvailabilitySchedule" ADD CONSTRAINT "AvailabilitySchedule_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "availableHours" ADD CONSTRAINT "availableHours_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "AvailabilitySchedule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExternalToolCredential" ADD CONSTRAINT "ExternalToolCredential_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
