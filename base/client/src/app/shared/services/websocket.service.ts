import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { Socket, io } from 'socket.io-client'
import { API } from 'src/app/config/endpoint.config';

export enum SocketEventEnum{
  CONVSTATUS = 'CONVSTATUS',
  MESSAGE = 'MESSAGE',
  NEWCONVERSATION = 'NEWCONVERSATION',
  AISUSPENDED = 'AISUSPENDED',
  RESUMEAIAGENT = 'RESUMEAIAGENT',
  CUSTOMERREQUEST = 'CUSTOMERREQUEST',
}

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {

  private socket!: Socket;
  private dashboardEventSubject = new Subject<any>();
  dashboardEvent$ = this.dashboardEventSubject.asObservable();

  private agentStatusEventSubject = new Subject<any>();
  agentStatusEvent$ = this.agentStatusEventSubject.asObservable();

  private eventDataSubject = new Subject<any>();
  private registeredEvents: Set<string> = new Set<string>();

  constructor() {

  }

  connectSocket() {
    if (!this.socket) {
      this.socket = io(API.rootURL, {
        extraHeaders: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      this.registerEvent();
    }
  }

  registerEvent() {
    this.socket.on('dashboardUpdate', (data) => {
      console.log(data);
      this.dashboardEventSubject.next(data);
    });

  }

  listenAgentUpdateEvent(agentId: string) {
    const event = `${agentId}_avatarStatusUpdate`;
    this.socket.on(event, (data) => {
      this.agentStatusEventSubject.next(data);
    });
  }

  offAgentUpdateEvent(agentId: string) {
    const event = `${agentId}_avatarStatusUpdate`;
    this.socket.off(event);
  }

  registerCustomEvent(eventName: string,eventType: SocketEventEnum): Observable<any> {
    console.log("[REGISTER EVENT]: ", eventName);
  
    if (this.registeredEvents.has(eventName)) {
      console.log("Event already registered:", eventName);
      return this.eventDataSubject.asObservable();
    }
  
    this.registeredEvents.add(eventName);
    this.socket.on(eventName, (data) => {
      this.eventDataSubject.next({...data,...{event:eventType}});
    });
    
    return this.eventDataSubject.asObservable();
  }

  unregisterCustomEvent(event: string): void {
    console.log("[UNREGISTER EVENT]: ",event);
    this.socket.off(event);
    this.registeredEvents.delete(event);
  }
  getRegisteredEvents(): string[] {
    return Array.from(this.registeredEvents);
  }

  emitEvent(eventName: string,payload: any)
  {
    this.socket.emit(eventName,payload);
  }
}
