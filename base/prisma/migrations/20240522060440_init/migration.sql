-- CreateEnum
CREATE TYPE "VerificationType" AS ENUM ('VERIFYEMAIL', 'FORGOTPASSWORD');

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
    "clientId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modifiedAt" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "Agent" (
    "id" TEXT NOT NULL,
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

    CONSTRAINT "Campaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Stage" (
    "id" TEXT NOT NULL,
    "agentId" TEXT,
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
    "tokenType" TEXT,
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
CREATE UNIQUE INDEX "Agent_name_key" ON "Agent"("name");

-- CreateIndex
CREATE INDEX "AgentId_agentFile_fkey" ON "AgentFile"("agentId");

-- CreateIndex
CREATE INDEX "AgentId_LeadConfig_fkey" ON "LeadConfig"("agentId");

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
CREATE INDEX "campaignId_Conversation_fkey" ON "Conversation"("campaignId");

-- CreateIndex
CREATE INDEX "visitorId_Conversation_fkey" ON "Conversation"("visitorId");

-- CreateIndex
CREATE INDEX "visitId_Conversation_fkey" ON "Conversation"("visitId");

-- CreateIndex
CREATE INDEX "convId_ZautoMessage_fkey" ON "ZautoMessage"("convId");

-- CreateIndex
CREATE INDEX "sentById_ZautoMessage_fkey" ON "ZautoMessage"("sentById");

-- CreateIndex
CREATE INDEX "agentId_Stage_fkey" ON "Stage"("agentId");

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
CREATE UNIQUE INDEX "CallToAction_name_key" ON "CallToAction"("name");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActiveClient" ADD CONSTRAINT "ActiveClient_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentFile" ADD CONSTRAINT "AgentFile_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadConfig" ADD CONSTRAINT "LeadConfig_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentPrompt" ADD CONSTRAINT "AgentPrompt_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Visit" ADD CONSTRAINT "Visit_visitorId_fkey" FOREIGN KEY ("visitorId") REFERENCES "Visitor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Visit" ADD CONSTRAINT "Visit_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_visitorId_fkey" FOREIGN KEY ("visitorId") REFERENCES "Visitor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_visitId_fkey" FOREIGN KEY ("visitId") REFERENCES "Visit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ZautoMessage" ADD CONSTRAINT "ZautoMessage_convId_fkey" FOREIGN KEY ("convId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ZautoMessage" ADD CONSTRAINT "ZautoMessage_sentById_fkey" FOREIGN KEY ("sentById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stage" ADD CONSTRAINT "Stage_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "availableHours" ADD CONSTRAINT "availableHours_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "AvailabilitySchedule"("id") ON DELETE CASCADE ON UPDATE CASCADE;
