import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { RestService } from 'src/app/shared/services/rest.service';
import { API } from 'src/app/config/endpoint.config';

export interface Avatar {
  id: string;
  orgId: string;
  name: string;
  displayName: string;
  usetools: boolean;
  role: string;
  companyName: string;
  companyBusiness: string;
  companyValue: string;
  purpouse: string;
  conversationType: string;
  logoUrl: string;
  welcomeMsg: string;
  llmModel: string;
  useAssistant: boolean;
  assistantId: string;
  siteObjUrl: string;
  createdAt: string;
  modifiedAt: string;
  status: string;
  styles: string;
  autoAnalysis: boolean;
  leadInfo:string;
  starters:string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class AvatarService {

  private avatar?: Avatar;

  private avatarSubject = new Subject<Avatar>();
  avatarEvent$ = this.avatarSubject.asObservable();

  constructor(private restService: RestService,) {

  }

  setAvatarData(data: any) {
    this.avatar = data;
    this.avatarSubject.next(data);
  }

  getAvatarData() {
    if(!this.avatar)
    {
    }
    return this.avatar;
  }

  getAvatarId()
  {
    return this.getAvatarData()?.id;
  }
}
