import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'lead'
})
export class LeadPipe implements PipeTransform {

  transform(value: any): string {
    if(value.length > 0)
    {
      const str = value.charAt(0).toUpperCase() + value.slice(1);
      return str.replace("_"," ");
    }
    else
    {
      return "";
    }
  }

}
