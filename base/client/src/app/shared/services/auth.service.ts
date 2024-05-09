import { Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';

export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  emailVerified: boolean;
}
@Injectable({
  providedIn: 'root',
})

export class AuthService {

  private userData:any = null;
  public showLoader:boolean=false;

  private eventSubject = new Subject<any>();
  event$ = this.eventSubject.asObservable();

  constructor(private router: Router, public ngZone: NgZone,) {
    
  }

  

isAuthenticated()
{
  const token = localStorage.getItem("token");
  if(token)
  {
    return true;
  }
  else
  {
    return false;
  }
}

setUser(userData:any)
{  
  this.userData = userData;
  this.emitUserEvent(userData);
}

getUser()
{
  return this.userData;
}

updateUser(key:string,value:string)
{
  const userData = this.getUser();
  if(userData)
  {
    userData[key] = value;
    this.setUser(userData);
    this.emitUserEvent(key);
  }
}


logout()
{
  this.userData = null;
  localStorage.removeItem("token");
  this.router.navigate(['/auth/login']);
}

emitUserEvent(data: any) {
  this.eventSubject.next(data);
}

}
