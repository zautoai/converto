import { Component, OnInit, AfterViewInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { AuthService } from 'src/app/shared/services/auth.service';
import { TableColumn, TableRow } from './widgets/table-card/table-card.component';
import { ChartCardComponent, ChartData } from './widgets/chart-card/chart-card.component';
import { RestService } from 'src/app/shared/services/rest.service';
import { API } from 'src/app/config/endpoint.config';
import { DateFilter } from 'src/app/common/enums';
import { forkJoin } from 'rxjs';

interface CountData{
  visitorCount:number;
  leadCount:number;
  convoCount:number;
  campaignCount:number;
}

export interface PercentageData {
  visitorPercentage: number;
  leadPercentage: number;
  conversationPercentage: number;
}

@Component({
  selector: 'app-zauto-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class ZautoDashboardComponent implements OnInit{

  intentScores : any = [] 
  predictiveLeadScores : any = []
  constructor(
    public authService: AuthService,
    private restService:RestService) { }


  ngOnInit(): void {
    this.getIntentScore()
    this.getPredictiveLeadScores()
  }

  getIntentScore(){
    this.restService.get(API.main.dashboard,'intent-score').subscribe((res:any)=>{
      this.intentScores = res.data;
    })
  }


  getPredictiveLeadScores(){
    this.restService.get(API.main.dashboard, 'predictive-lead-score').subscribe((res:any)=>{
      this.predictiveLeadScores = res.data;
    })
  }
}

