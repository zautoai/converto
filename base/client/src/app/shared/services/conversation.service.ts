import { Injectable } from "@angular/core";


export interface User {
  id: number;
  name: string;
  status: string;
  profileImage: string |undefined;
  username: string;
  statusColor: string;
  lastSeen: string;

}
export interface Message {
  [x: string]: string;
  sender: string; // Add the sender property
  text: string;
  timestamp: string;
}
export enum SenderType {
  User = "user",
  Client = "client",
}

@Injectable({
  providedIn: 'root',
})

export class Conversationservice {
  users: User[] = [
    {
      id: 1,
      name: 'Giri',
      status: 'online',
      profileImage: 'https://tse1.mm.bing.net/th?id=OIP.Ghae4OEdb4UmC3hkqpFvLAHaGd&pid=Api&P=0&h=180',
      username: 'Giri',
      statusColor: 'bg-success',
      lastSeen: 'Last seen recently',

    },
    {
      id: 2,
      name: 'arun',
      status: 'offline',
      profileImage: 'https://tse1.mm.bing.net/th?id=OIP.Ghae4OEdb4UmC3hkqpFvLAHaGd&pid=Api&P=0&h=180',
      username: 'Arun',
      statusColor: 'bg-danger',
      lastSeen: 'Last seen 2 hours ago',

    },
    {
      id: 3,
      name: 'sakthi',
      status: 'offline',
      profileImage: 'https://tse1.mm.bing.net/th?id=OIP.Ghae4OEdb4UmC3hkqpFvLAHaGd&pid=Api&P=0&h=180',
      username: 'Sakthi',
      statusColor: 'bg-success',
      lastSeen: 'Last seen 3 hours ago',

    },
    {
      id: 4,
      name: 'naveen',
      status: 'offline',
      profileImage: 'https://tse1.mm.bing.net/th?id=OIP.Ghae4OEdb4UmC3hkqpFvLAHaGd&pid=Api&P=0&h=180',
      username: 'Naveen',
      statusColor: 'bg-danger',
      lastSeen: 'Last seen 3 hours ago',

    },
    {
      id: 5,
      name: 'mathesh',
      status: 'offline',
      profileImage: 'https://tse1.mm.bing.net/th?id=OIP.Ghae4OEdb4UmC3hkqpFvLAHaGd&pid=Api&P=0&h=180',
      username: 'Mathesh',
      statusColor: 'bg-success',
      lastSeen: 'Last seen 3 hours ago',

    },
    // Add more users here
  ];



  selectedUser: User | null = null; // Initialize with no selected user

  messages: { [key: string]: Message[] } = {
    giri: [
      { sender: "user", text: 'Hello, how are you?', timestamp: '8:40 AM, Today' },
      { sender: "client", text: 'am good', timestamp: '8:40 AM, Today' },
      { sender: "user", text: 'ping me,if you are free ?', timestamp: '8:40 AM, Today' },

      // Add more messages for Giri here
    ],
    arun: [
      { sender: "user", text: "good morning !", timestamp: '8:55 AM, Today' },
      { sender: "client", text: 'good morning !', timestamp: '8:40 AM, Today' },
      { sender: "user", text: 'enna panura', timestamp: '8:40 AM, Today' },
      // Add more messages for John here
    ],
    sakthi: [
      { sender: "user", text: "good evening!", timestamp: '8:55 AM, Today' },
      { sender: "client", text: 'Good evening', timestamp: '8:40 AM, Today' },
      { sender: "user", text: 'are you free', timestamp: '8:40 AM, Today' },
      // Add more messages for John here
    ],
    naveen: [
      { sender: "user", text: "Hello guys", timestamp: '8:55 AM, Today' },
      { sender: "client", text: 'hii buddy', timestamp: '8:40 AM, Today' },
      { sender: "user", text: 'what happen ?', timestamp: '8:40 AM, Today' },
      // Add more messages for John here
    ],
    mathesh: [
      { sender: "user", text: "Hey! are you free now", timestamp: '8:55 AM, Today' },
      { sender: "client", text: 'hiii dudess', timestamp: '8:40 AM, Today' },
      { sender: "user", text: 'yes,please join', timestamp: '8:40 AM, Today' },
      // Add more messages for John here
    ],
  };

  // Function to handle user selection

  getMessageByName(name: string): Message[] {
    const messagesForName = this.messages[name];
    return messagesForName;

  }





}
