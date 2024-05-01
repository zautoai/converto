import { ExternalToolLevel, ToolType } from "../enums/enums";

export interface ProviderConfig {
    type?: ToolType
    authUrl?: string;
    tokenUrl?: string;
    profileUrl?: string;
    propertyUrl?: string;
    clientId: string;
    clientSecret: string;
    redirectUri: string;
    scope: string[];
    level: ExternalToolLevel;
}

export const providers: { [key: string]: ProviderConfig } = {
    hubspot: {
        type: ToolType.CRM,
        authUrl: "https://app.hubspot.com/oauth/authorize",
        tokenUrl: "https://api.hubapi.com/oauth/v1/token",
        profileUrl: "https://api.hubapi.com/integrations/v1/me",
        propertyUrl: "https://api.hubapi.com/properties/v2/contacts/properties?property=name",
        clientId: process.env.HUBSPOT_CLIENT_ID,
        redirectUri: process.env.HUBSPOT_REDIRECT_URI,
        clientSecret: process.env.HUBSPOT_CLIENT_SECRET,
        level: ExternalToolLevel.ORGLEVEL,
        scope: [
            'e-commerce',
            'tickets',
            'crm.objects.goals.read',
            'media_bridge.read',
            'crm.objects.custom.read',
            'crm.objects.custom.write',
            'crm.schemas.contacts.read', 
            'crm.schemas.contacts.write',
            'crm.objects.contacts.write',
            'crm.objects.line_items.read',
            'crm.objects.line_items.write', 
            'crm.objects.quotes.write',
            'crm.objects.quotes.read',
            'crm.objects.contacts.read',
            'crm.objects.companies.read',
            'crm.objects.deals.read',
            'crm.objects.deals.write',
            'crm.objects.companies.write',
            'settings.users.read'
        ]
    },
    google: {
        type: ToolType.CALENDAR,
        authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
        tokenUrl: "https://oauth2.googleapis.com/token",
        profileUrl: "https://www.googleapis.com/oauth2/v3/userinfo",
        propertyUrl: "",
        clientId: process.env.GOOGLE_CLIENT_ID, 
        redirectUri: process.env.GOOGLE_CALBACK_URI,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        level: ExternalToolLevel.ORGLEVEL,
        scope: ['profile', 'email','https://www.googleapis.com/auth/calendar'], 
    },
    slack:{
        type: ToolType.COMMUNICATION,
        authUrl: "https://slack.com/oauth/v2/authorize",
        tokenUrl: "https://slack.com/api/oauth.v2.exchange",
        profileUrl: "https://www.googleapis.com/oauth2/v3/userinfo",
        propertyUrl: "",
        clientId: process.env.SLACK_CLIENT_ID, 
        redirectUri: process.env.SLACK_REDIRECT_URI,
        clientSecret: process.env.SLACK_CLIENT_SECRET,
        level: ExternalToolLevel.ORGLEVEL,
        scope: [
            'channels:history', 
            'channels:join',
            'channels:read',
            'chat:write',
            'chat:write.customize',
            'chat:write.public',
            'groups:history',
            'groups:read',
            'groups:write',
            'usergroups:read',
            'users.profile:read',
            'users:read',
            'users:read.email',
        ],    
    }
}; 

export const ZautoCRMProperties = {
    lead:[
        "lead.name",
        "lead.email",
        "lead.mobile",
        "lead.info",
        "lead.createdAt",
        "lead.modifiedAt",
    ],
    conversation:[
        "conversation.campaign.title",
        "conversation.summary",
        "conversation.sentimental",
        "conversation.suggestions",
        "conversation.potentialLevel",
        "conversation.status",
        "conversation.suggestions",
        "conversation.createdAt",
        "conversation.modifiedAt",
    ],
    visitor:[
        "visitor.trackingInfo",
        "visitor.trackingInfo",
        "visitor.createdAt",
        "visitor.modifiedAt",
        "visitor.trackingInfo.ip",
        "visitor.trackingInfo.is_eu",
        "visitor.trackingInfo.city",
        "visitor.trackingInfo.region",
        "visitor.trackingInfo.region_code",
        "visitor.trackingInfo.region_type",
        "visitor.trackingInfo.country_name",
        "visitor.trackingInfo.country_code",
        "visitor.trackingInfo.continent_name",
        "visitor.trackingInfo.continent_code",
        "visitor.trackingInfo.latitude",
        "visitor.trackingInfo.longitude",
        "visitor.trackingInfo.postal",
        "visitor.trackingInfo.calling_code",
        "visitor.trackingInfo.currency",
        "visitor.trackingInfo.currency",
        "visitor.trackingInfo.currency.name",
        "visitor.trackingInfo.currency.code",
        "visitor.trackingInfo.time_zone.name",
        "visitor.trackingInfo.time_zone.offset",
    ],
    visit:[
        "visit.campaign.title",
        "visit.campaignId",
        "visit.source",
        "visit.count",
        "visit.conversation",
        "visit.createdAt",
        "visit.modifiedAt",
    ],
};