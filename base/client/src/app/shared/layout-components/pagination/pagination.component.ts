import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { PaginationData } from '../../../common/intefaces';
@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.scss',
})
export class PaginationComponent implements OnInit {

  @Input() totalItems = 0;
  @Input() limit = 10;
  currentPage = 1;
  @Output() pageChanged: EventEmitter<PaginationData> = new EventEmitter<PaginationData>();


  constructor(
    private router: Router,
    private route: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.currentPage = +params['page'] || 1;
    });
  }

  onPageChange(event: any) {
    this.router.navigate([], {
      queryParams: { page: event, limit: this.limit },
    });
    this.pageChanged.emit({ page: event, limit: this.limit });
  }
}
