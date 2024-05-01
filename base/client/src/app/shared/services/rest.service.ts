import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {map} from 'rxjs/operators';
import { API } from '../../config/endpoint.config';


@Injectable({
    providedIn: 'root'
  })
export class RestService {

  constructor(private http: HttpClient) {
  }

  getHeader(credential?: string) {
    if (!credential) {
      return {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem('token')
        })
      };
    } else {
      return {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': 'Basic ' + btoa(credential)
        })
      };
    }
  }

  getURL(path: string) {
    return API.rootURL + path;
  }

  private extractData(res: Object) {
    const body = res;
    return body || {};
  }

  auth(userName: string, password: string) {
    const url = this.getURL(API.main.auth);
    const options = this.getHeader(userName + ':' + password);

    const data = {email: userName, password: password};
    return this.http.post(url, data, options).pipe(
      map(this.extractData));
  }

  login(userName: string, password: string) {
    const url = this.getURL(API.main.auth);
    const options = this.getHeader(userName + ':' + password);

    const data = {email: userName, password: password};
    return this.http.post(url, data, options).pipe(
      map(this.extractData));
  }

  verifyToken() {
    const url = this.getURL(API.main.auth);
    const options = this.getHeader();

    return this.http.get(url, options).pipe(
      map(this.extractData));
  }

  get(resourcePath: string, pathParam: string) {
    const url = this.getURL(resourcePath + '/' + pathParam );
    const options = this.getHeader();
    return this.http.get(url, options).pipe(
      map(this.extractData));
  }

  getAll(resourcePath: string) {
    const url = this.getURL(resourcePath);
    const options = this.getHeader();
    return this.http.get(url, options).pipe(
      map(this.extractData));
  }

  post(resourcePath: string, data: any) {
    const url = this.getURL(resourcePath);
    const options = this.getHeader();
    return this.http.post(url, data, options).pipe(
      map(this.extractData));
  }

  put(resourcePath: string, pathParam: string, data: Object) {
    const url = this.getURL(resourcePath + '/' + pathParam);
    const options = this.getHeader();
    return this.http.put(url, data, options).pipe(
      map(this.extractData));
  }

  patch(resourcePath: string, pathParam: string, data: Object) {
    const url = this.getURL(resourcePath + '/' + pathParam);
    const options = this.getHeader();
    return this.http.patch(url, data, options).pipe(
      map(this.extractData));
  }

  delete(resourcePath: string, pathParam: string) {
    const url = this.getURL(resourcePath + '/' + pathParam);
    const options = this.getHeader();
    return this.http.delete(url, options).pipe(
      map(this.extractData));
  }

  getExternal(resourcepath: string) {
    return this
      .http
      .get(resourcepath, {responseType: 'json'});
  }

  uploadFile(resourcePath: string, data: any) {
    const url = this.getURL(resourcePath);
    const options = {headers: new HttpHeaders({
      'Authorization': 'Bearer ' + localStorage.getItem('token')
    })}
    return this.http.post(url, data, options).pipe(
      map(this.extractData));
  }
}