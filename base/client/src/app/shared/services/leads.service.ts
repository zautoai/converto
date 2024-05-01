import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LeadsService {

  constructor() { }
  userList = [
    {
      id: 1,
      name: "Giri",
      email: "giri@zauto.ai",
      mobile: "987654321",
    },
    {
      id: 2,
      name: "naveen",
      email: "naveen@zauto.ai",

      mobile: "987654321",
    },
    {
      id: 3,
      name: "madhesh",
      email: "madhesh@zauto.ai",

      mobile: "987654321",
    },
    {
      id: 4,
      name: "priyanka",
      email: "priyanka@zauto.ai",

      mobile: "987654321",
    },
    {
      id: 5,
      name: "user1",
      email: "user@zauto.ai",

      mobile: "987654321",
    }
  ];
  getAllLeads() {
    console.log(this.userList.length)
    return this.userList;
}
getLeadsById(id: number) {
  return this.userList.find(u => u.id === id);
}


deleteLeads(leadsId: string) {

}

}
