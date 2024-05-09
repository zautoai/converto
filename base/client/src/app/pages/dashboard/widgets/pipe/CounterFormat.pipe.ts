import { Pipe, type PipeTransform } from '@angular/core';

@Pipe({
  name: 'counterFormat',
})
export class CounterFormatPipe implements PipeTransform {

  transform(value: number): string {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

}
