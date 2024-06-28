import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { DateFilter } from 'src/app/common/enums';
import { API } from 'src/app/config/endpoint.config';
import { RestService } from 'src/app/shared/services/rest.service';

export interface PageMetrics {
  pages: string;
  visits: number;
  ctr: number;
  avgTimeSpent: string;
  scrollDepth: string;
}

const ELEMENT_DATA: PageMetrics[] = [
  { pages: 'Home', visits: 1200, ctr: 5.4, avgTimeSpent: '3m 20s', scrollDepth: '70%' },
  { pages: 'Products', visits: 900, ctr: 4.7, avgTimeSpent: '2m 45s', scrollDepth: '60%' },
  { pages: 'Contact', visits: 300, ctr: 6.1, avgTimeSpent: '1m 30s', scrollDepth: '50%' },
  { pages: 'About Us', visits: 400, ctr: 3.2, avgTimeSpent: '2m 10s', scrollDepth: '65%' },
  { pages: 'FAQ', visits: 200, ctr: 5.0, avgTimeSpent: '1m 55s', scrollDepth: '55%' },
];

@Component({
  selector: 'app-page-replacement',
  templateUrl: './page-replacement.component.html',
  styleUrls: ['./page-replacement.component.scss'],
})
export class PageReplacementComponent implements OnInit, OnChanges{

  DateFilter : any = DateFilter;
  @Input() selectedDateFilter: any = DateFilter.THIS_MONTH;
  @Input() startDate: string = '';
  @Input() endDate: string = '';


  constructor(
    private restService:RestService
  ){}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedDateFilter'] || changes['startDate'] || changes['endDate']) {
      if(this.selectedDateFilter === DateFilter.BETWEEN && (!this.startDate || !this.endDate)) return
      this.getPageEnhancementMetrics(this.selectedDateFilter, this.selectedDateFilter === DateFilter.BETWEEN ? { start: this.startDate, end: this.endDate } : undefined);
    }
  }

  ngOnInit(): void {
    this.getPageEnhancementMetrics(this.selectedDateFilter, this.selectedDateFilter === DateFilter.BETWEEN ? { start: this.startDate, end: this.endDate } : undefined);
  }

  displayedColumns: string[] = ['pages', 'visits', 'ctr', 'avgTimeSpent', 'scrollDepth'];
  dataSource = new MatTableDataSource<PageMetrics>(ELEMENT_DATA);

  getPageEnhancementMetrics(dateFilter: string, range?: { start: string, end: string }){
    const params = range 
    ? `dateFilter=${dateFilter}&start=${range.start}&end=${range.end}` 
    : `dateFilter=${dateFilter}`;
    this.restService.get(API.main.dashboard,`page-enhancement-metrics?${params}`).subscribe((res:any)=>{
      this.dataSource.data = res.data;
      console.log(res.data);
      
    })
  }
}
