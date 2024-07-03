import { Component, Input } from '@angular/core';
import { Subscription } from 'rxjs';
import { API } from 'src/app/config/endpoint.config';
import { RestService } from 'src/app/shared/services/rest.service';




@Component({
  selector: 'app-summary-container',
  templateUrl: './summary-container.component.html',
  styleUrls: ['./summary-container.component.scss']
})
export class SummaryContainerComponent {

  @Input() data:any = null;

  isUserSummaryLoading: boolean = false;
  isGenerateSummaryLoading: boolean = false;
  private convSummarySubscription!: Subscription;

  constructor(
    private restService:RestService,
    ){}

  getSummary(convId: string) {
    if(convId)
    {
      if(this.convSummarySubscription)
      {
        this.convSummarySubscription.unsubscribe();
      }
      this.isUserSummaryLoading = true;
      this.convSummarySubscription = this.restService.get(API.main.conversation,`${convId}/summary`)
      .subscribe((response:any)=>{
        this.data = {...this.data,...response};
        // this.data = {...{
        //   summary: response?.summary,
        //   suggestions: response?.suggestions,
        //   sentimental: response?.sentimental
        // }};      
        this.isUserSummaryLoading = false;
      },(error)=>{
        this.isUserSummaryLoading = false;
        console.log(error);
      });
    }
    else
    {
      console.error("ConvID missing");
    }

  }

  jsonParser(jsonString: string) {
    const object = JSON.parse(jsonString);
    return object;
  }

  generateSummary(conversation:any ){
    this.isGenerateSummaryLoading = true;
    this.restService.patch(API.main.conversation, `generate-summary/${conversation.id}`,{})
    .subscribe((response:any)=>{
      this.isGenerateSummaryLoading = false;
      this.getSummary(conversation.id);
    },(error)=>{
      this.isGenerateSummaryLoading = false;
      console.log(error);
    });
  }

}
