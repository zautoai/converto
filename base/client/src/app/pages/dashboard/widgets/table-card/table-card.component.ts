import { Component, Input } from '@angular/core';

export interface TableColumn {
  key: string;
  name: string;
}

export interface TableRow {
  [key: string]: any;
}

@Component({
  selector: 'app-table-card',
  templateUrl: './table-card.component.html',
  styleUrls: ['./table-card.component.scss']
})
export class TableCardComponent {
  @Input() isLoading:boolean = false;
  @Input() title!: string;
  @Input() columns: TableColumn[] = [];
  @Input() data: TableRow[] = [];
}
