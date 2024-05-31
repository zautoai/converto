import { Component, Input } from '@angular/core';
import { TableColumn } from 'src/app/common/intefaces';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class TableComponent {

  @Input() title:string = '';
  @Input() columns: TableColumn[] = [];
  @Input() data: any[] =[];
}
