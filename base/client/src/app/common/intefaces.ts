import { TemplateRef } from "@angular/core";

export interface IntegrationConfig {
  provider:string;
  icon:string;
  description:string;
  btntext:string;
}
export interface PaginationData {
  page: number;
  limit: number;
}


  export interface availableHour{
    id?:string;
    orgId?:string;
    scheduleId?:string;
    start:string;
    end:string;
  }

export interface TableColumn {
  header: string;
  field: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
  cellTemplate?: TemplateRef<any>; 
  headerTemplate?: TemplateRef<any>;
}

export interface DataCollection{
  data:any[];
  page:number;
  total:number;
}

export interface Visit {
  id: string;
  count: number;
  source: string;
  createdAt: string;
}

export interface IVisitorData {
  countryName?: string;
  visitCount: number;
  visitSource: string;
  visitedAt: string;
}