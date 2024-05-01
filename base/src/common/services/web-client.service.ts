import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import axios, { AxiosError } from 'axios';
import { catchError, firstValueFrom } from 'rxjs';


@Injectable()
export class WebClientService {
  constructor(private readonly httpService: HttpService) {}

  async get(url: string,headers = {}): Promise<any> {
    const { data } = await firstValueFrom(
      this.httpService.get(url,{headers}).pipe(
        catchError((error: AxiosError) => {
          console.error(error.response.data);
          throw error.message;
        }),
      ),
    );
    return data;
  }

  async post(url: string, reqData: any, headers: any = {}): Promise<any> {
    const { data } = await firstValueFrom(
      this.httpService.post(url, reqData, {headers}).pipe(
        catchError((error: AxiosError) => {
          console.error(error);
          throw 'An error happened!';
        }),
      ),
    );
    return data;
  }

  async put(url: string, reqData: any, headers: any = {}): Promise<any> {
    const { data } = await firstValueFrom(
      this.httpService.put(url, reqData, {headers}).pipe(
        catchError((error: AxiosError) => {
          console.error(error);
          throw 'An error happened!';
        }),
      ),
    );
    return data;
  }

  async delete(url: string, headers: any = {}): Promise<any> {
    const { data } = await firstValueFrom(
      this.httpService.delete(url, {headers}).pipe(
        catchError((error: AxiosError) => {
          console.error(error);
          throw 'An error happened!';
        }),
      ),
    );
    return data;
  }

  async postForEmbedding(url: string, reqData: any, headers: any = {}): Promise<any> {
    try {
          const response = await axios.post(url, reqData, {
          headers: headers,
        });
        return response.data;
    } catch(error) {
      console.error(error)
    }
    
  }
}