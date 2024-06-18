import { Component } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';

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
export class PageReplacementComponent {
  displayedColumns: string[] = ['pages', 'visits', 'ctr', 'avgTimeSpent', 'scrollDepth'];
  dataSource = new MatTableDataSource<PageMetrics>(ELEMENT_DATA);
}
