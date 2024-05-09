import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { API } from 'src/app/config/endpoint.config';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { RestService } from 'src/app/shared/services/rest.service';

@Component({
  selector: 'app-prompt',
  templateUrl: './prompt.component.html',
  styleUrls: ['./prompt.component.scss']
})
export class PromptComponent implements OnInit{

  currentPrompt:any = null;
  promptText:string = '';
  templateList:any = [];
  selectedTemplate:any = 'NA';
  isUpdateing:boolean = false;
  canEdit:boolean = false;
  originalSettings: any;

  @ViewChild('templateForm') templateForm!: NgForm;

  constructor(
    private readonly restService:RestService,
    private readonly notifService:NotificationService,
  ){}

  ngOnInit(): void 
  {
    this.getAgentPrompt();
    this.getAllTemplates();
  }

  toggleEdit()
  {
    this.canEdit = !this.canEdit;
    if(!this.canEdit)
    {
      this.selectedTemplate = this.originalSettings?.templateId || 'NA';
    }
  }

  private getAgentPrompt()
  {
    this.restService.getAll(API.main.agentPrompt)
    .subscribe({
      next:(response:any) =>{
        this.currentPrompt = response;
        this.selectedTemplate = this.currentPrompt?.type === 'custom' ? 'NA' : this.currentPrompt?.templateId ?? 'NA';
        this.promptText = this.currentPrompt?.type === 'custom' ? this.currentPrompt?.text ?? '' : '';
        this.originalSettings = {...this.currentPrompt};
      },
      error:(error) =>{
        console.log(error);
      }
    });
  }

  private getAllTemplates()
  {
    this.restService.getAll(API.main.promptTemplate)
    .subscribe({
      next:(response:any)=>{
        this.templateList = response;
      },
      error:(error) =>{
        console.log(error);
      }
    });
  }

  findTemplateById(id: string): any {
    return this.templateList.find((template:any) => template.id === +id);
  }
  

  onSubmit()
  {
    if(this.selectedTemplate !== 'NA')
    {
      if (this.templateForm.valid)
      {
        const variables = this.findTemplateById(this.selectedTemplate)?.variables.filter((keyValuePair: any) => {
          return keyValuePair && keyValuePair.value;
        })
        const date = {
          templateId: this.selectedTemplate,
          variables: variables
        };
        this.isUpdateing = true;
        this.restService.post(API.main.promptTemplate,date)
        .subscribe({
          next:(response:any)=>{
            this.isUpdateing = false;
            this.canEdit = false;          
            this.getAgentPrompt();
            this.notifService.showSuccess('Prompt saved successfully'); 
          },
          error:(error)=>{
            this.isUpdateing = false;
            this.notifService.showError('Failed to save prompt. Please try again.');
          }
        });
      }
      else
      {
        Object.values(this.templateForm.controls).forEach(control => {
          control.markAsTouched();
        });
      }
      
    }
    else
    {
      if(this.promptText.length === 0)
      {
        return;
      }
      const date = {
        prompt: this.promptText,
        variables: [
        
        ]
      };
      
      this.isUpdateing = true;
      this.restService.post(API.main.promptTemplate + "/custom",date)
      .subscribe({
        next:(response:any)=>{
          this.isUpdateing = false;
          this.canEdit = false;
          this.getAgentPrompt();
          this.notifService.showSuccess('Custom prompt saved successfully');
        },
        error:(error)=>{
          this.isUpdateing = false;
          this.notifService.showError('Failed to save custom prompt. Please try again.');
        }
      });
    }
    
  }
}
