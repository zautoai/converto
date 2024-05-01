export enum ConversationType {
  CALL = 'CALL',
  CHAT = 'CHAT',
}

export enum SiteProcessStatus {
  // Fill this with the valid status values
  FAILED = 'FAILED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  //... Add any other statuses as required
}

export enum VerificationType {
  VERIFYEMAIL = 'VERIFYEMAIL',
  FORGOTPASSWORD = 'FORGOTPASSWORD',
}

export enum CampaignStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export enum OrgAccountStatus {
  ACTIVE = 'ACTIVE',
  EXPAIRED = 'EXPAIRED',
  PENDING = 'PENDING',
}

export enum ExternalToolLevel {
  USERLEVEL = 'USERLEVEL',
  ORGLEVEL = 'ORGLEVEL',
}

export enum AuthType {
  NONE = 'NONE',
  BASIC = 'BASIC',
  TOKEN = 'TOKEN',
}

export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
}

export enum DateFilter {
  THIS_MONTH = 'this_month',
  LAST_MONTH = 'last_month',
  THIS_WEEK = 'this_week',
  BETWEEN = 'between'
}

export enum ToolType {
  RESTAPI = 'RESTAPI',
  CRM = 'CRM',
  CALENDAR = 'CALENDAR',
  COMMUNICATION = 'COMMUNICATION'
}

export enum CTAType {
  CTA = 'CTA',
  NAVIGATOR = 'NAVIGATOR',
  CALENDAR = 'CALENDAR',
}
