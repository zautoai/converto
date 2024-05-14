import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';

import { PaginationData } from '../../../common/intefaces';
@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.scss',
})
export class PaginationComponent implements OnInit{

  @Input() totalPages = 0;
  @Input() limit = 10;
  currentPage = 1;


  @Output() pageChanged: EventEmitter<PaginationData> = new EventEmitter<PaginationData>();


  constructor(
    private router: Router,
    private route: ActivatedRoute,
    ) {
      
    }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.currentPage = +params['page'] || 1;
      this.limit = +params['limit'] || 10;
    });
  }

  onPageChange(event: any) 
  {
    this.router.navigate([], {
      queryParams: { page: event, limit: this.limit },
      queryParamsHandling: 'merge'
    });
    this.pageChanged.emit({ page: event, limit: this.limit });
  }
}