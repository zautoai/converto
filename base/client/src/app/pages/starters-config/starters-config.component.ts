import { Component,OnInit } from '@angular/core';
import { RestService } from 'src/app/shared/services/rest.service';
import { API } from 'src/app/config/endpoint.config';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { AvatarService } from 'src/app/shared/services/avatar.service';

@Component({
  selector: 'app-starters-config',
  templateUrl: './starters-config.component.html',
  styleUrls: ['./starters-config.component.scss']
})
export class StartersConfigComponent implements OnInit
{
  isChanged:boolean = false;
  canEdit:boolean = false;

  fields: string[] = [];
  originalFields: string[] = [];
  newField: string = '';
  isUpdateing:boolean = false;

  constructor(
    private restService:RestService,
    public avatarService:AvatarService,
    private notifService:NotificationService,
  ){}

  ngOnInit(): void {
    if(this.avatarService.getAvatarData()?.starters)
    {
      this.fields = this.avatarService.getAvatarData()?.starters.split(',') || [];
    }
    this.originalFields = [...this.fields];
  }

  deleteField(index: number) {
    this.fields.splice(index, 1);
  }

  addField() {
    if (this.newField.trim() !== '') {
      this.fields.push(this.newField);
      this.newField = ''; 
    }
  }

  toggleEdit()
  {
    this.canEdit = !this.canEdit;
    if(!this.canEdit)
    {
      this.fields = [...this.originalFields];
    }
  }

  submit(): void {
    const data = {starters:this.fields.join(',')};
    const agentId = this.avatarService.getAvatarId();
    if(agentId)
    {
      this.isUpdateing = true;
      let pathParam = agentId+'/starters'
      this.restService.patch(API.main.agent,pathParam,data)
      .subscribe((response:any)=>{
        this.avatarService.setAvatarData(response);     
        this.isChanged = false;
        this.canEdit = false;
        if(this.avatarService.getAvatarData()?.starters)
        {
          console.log(this.avatarService.getAvatarData()?.starters)
          this.fields = this.avatarService.getAvatarData()?.starters.split(',') || [];
        }
        this.isUpdateing = false;
        this.notifService.showSuccess('Starters Updated Successfully');
      },(error)=>{
        console.log(error);
        this.isChanged = false;
        this.canEdit = false;
        this.fields = [...this.originalFields];  
        this.isUpdateing = false;
        this.notifService.showError('Error Updating Starters');     
      })
    }
  }
}
