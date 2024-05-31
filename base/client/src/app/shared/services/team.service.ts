import { Injectable } from "@angular/core";
import { RestService } from "./rest.service";
import { API } from "src/app/config/endpoint.config";


@Injectable({
    providedIn: 'root',
})
export class TeamService {
  

    constructor(private restService: RestService) {

    }

    

    getAllUsers = () => {
      return this.restService.getAll(API.main.user);
    }

    getUserById = (id: string) => {
      return this.restService.get(API.main.user, id);
    }

    createUser = (user: any) => { 
      return this.restService.post(API.main.user, user);
    }

    updateUser = (user: any) => {
        return this.restService.patch(API.main.user, user.id, user);
    }

    deleteUser = (id: string) => {
        return this.restService.delete(API.main.user, id);
    }
    
}