import { Component,Input,Output,EventEmitter,OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.scss']
})
export class PaginationComponent implements OnInit{

  currentPage: number = 1;
  @Input() totalItem: number = 0;
  @Input() limit: number = 0;

  @Output() pageChange  = new EventEmitter<number>();

  constructor(
    private router: Router, 
    private route: ActivatedRoute
    ){
    }
    
    ngOnInit(): void {
      
      this.route.queryParams.subscribe(params => {
        this.currentPage = +params['page'] || 1;
        // this.pageChange.emit(this.currentPage);
      });
    }

  previousPage()
  {
    if(this.currentPage > 1)
    {
      this.gotoPage(this.currentPage - 1);
    }
  }

  nextPage()
  {
    if(this.currentPage < this.getPageCount())
    {
      this.gotoPage(this.currentPage + 1);
    }
  }

  gotoPage(page:number)
  {
    
    if (page >= 1 && page <= this.getPageCount())
    {
      this.pageChange.emit(page);
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { page },
        queryParamsHandling: 'merge',
      });
    }
  }

  generatePageArray(): (number | string)[] {
    const pageCount = this.getPageCount();
    const currentPage = this.currentPage;
    const pagesToShow = 5; // Number of page numbers to show
  
    if (pageCount <= pagesToShow) {
      return Array.from({ length: pageCount }, (_, i) => i + 1);
    }
  
    const pages: (number | string)[] = [];
  
    const halfPagesToShow = Math.floor(pagesToShow / 2);
    const firstPage = Math.max(1, currentPage - halfPagesToShow);
    const lastPage = Math.min(pageCount, currentPage + halfPagesToShow);
  
    if (firstPage > 1) {
      pages.push(1);
      if (firstPage > 2) {
        pages.push('...');
      }
    }
  
    for (let i = firstPage; i <= lastPage; i++) {
      pages.push(i);
    }
  
    if (lastPage < pageCount) {
      if (lastPage < pageCount - 1) {
        pages.push('...');
      }
      pages.push(pageCount);
    }
  
    return pages;
  }

  getPageCount():number
  {
    return Math.round(this.totalItem / this.limit);
  }
  
}
