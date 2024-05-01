import { Injectable } from '@angular/core';

interface platform{
  name:string;
  icon:string;
}

@Injectable({
  providedIn: 'root'
})
export class PlatformService {

  constructor() { }

  otherPlatform:platform = {name:'other',icon:'globe'};

  defaultPlatforms:platform[] = [
    {
      name:'facebook',
      icon:'facebook',
    },
    {
      name:'instagram',
      icon:'instagram',
    },
    {
      name:'whatsapp',
      icon:'whatsapp',
    },
    {
      name:'linkedin',
      icon:'linkedin',
    },
    {
      name:'youtube',
      icon:'youtube',
    },
    {
      name:'twitter',
      icon:'twitter',
    },
  ]
}
