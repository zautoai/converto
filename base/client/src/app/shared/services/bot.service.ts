import { Injectable } from "@angular/core";
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BotService {

  visitorId: string | null = null;
  visitId: string | null = null;

  defaultBotLogo: string = "./assets/images/users/default-user.png";

  private eventSubject = new Subject<any>();
  event$ = this.eventSubject.asObservable();

  constructor() {
    this.initialize();
  }
  
  initialize()
  {
    const visitorId = localStorage.getItem("visitorId");
    const visitId = localStorage.getItem("visitId");
    if(visitorId) this.setVisitor(visitorId);
    if(visitId) this.setVisit(visitId);
  }

  getDefaultBotLogo() {
    return this.defaultBotLogo;
  }

  emitAgentEvent(data: any) {
    this.eventSubject.next(data);
  }

  // visitor Actions

  setVisitor(id: string) {
    this.visitorId = id;
    localStorage.setItem("visitorId", id);
  }

  getVisitor(): String | null {
    return this.visitorId;
  }

  removeVisitor() {
    this.visitorId = null;
    localStorage.removeItem("visitorId");
  }

  // visit actions
  setVisit(id: string) {
    this.visitId = id;
    localStorage.setItem("visitId", id);
  }

  getVisit(): String | null {
    return this.visitId;
  }

  removeVisit() {
    this.visitId = null;
    localStorage.removeItem("visitId");
  }

  setTestMode() {
    this.visitId = null;
    this.visitorId = null;
  }
}


