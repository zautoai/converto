import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RestService } from 'src/app/shared/services/rest.service';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { API } from 'src/app/config/endpoint.config';
import { SweetAlertService } from 'src/app/shared/services/sweet-alart.service';
import { AuthService } from 'src/app/shared/services/auth.service';

@Component({
  selector: 'app-hubspot',
  templateUrl: './hubspot.component.html',
  styleUrls: ['./hubspot.component.scss']
})
export class HubspotComponent implements OnInit {

  zautoCRMProperties:any = {};
  hubspotCRMProperties:any = {};
  
  toolData: any = null;
  selectedMapping: any = null;
  keyMappingData: any[] = [];
  profile: any = null;
  mappingForm: FormGroup;
  errorFeedback: any = { fieldName: "", externalFieldName: "" };
  @ViewChild('addMappingCanvas') addMappingCanvas: ElementRef | any;

  getFields(fieldGroup: string) {
    return Object.values(this.zautoCRMProperties[fieldGroup]);
  }

  @ViewChild('editMappingCanvas') editMappingCanvas: ElementRef | any;

  constructor(
    private offcanvasService: NgbOffcanvas,
    private formBuilder: FormBuilder,
    private restService: RestService,
    private notifiService: NotificationService,
    private sweetAlertService: SweetAlertService,
    private authService: AuthService,
  ) {
    this.mappingForm = this.formBuilder.group({
      fieldName: ['', Validators.required],
      externalFieldName: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.getZautoProperties();
    this.getHubspotProperties();
    this.getProfileFromProviders('hubspot')
  }

  getProfileFromProviders(provider: string) {
    const endpoint = API.main.oauthProfile.replaceAll('{{provider}}', provider);
    this.restService.getAll(endpoint)
      .subscribe((response: any) => {
        this.profile = response;
        this.getOrgTool()
      }, (error) => {
        console.log(error);
      });

  }

  getZautoProperties()
  {
    const endpoint = API.main.crmProperties.replaceAll("{{provider}}",'zauto');
    this.restService.getAll(endpoint)
    .subscribe((response: any)=>{
      this.zautoCRMProperties = this.transformObjectToOptions(response);      
    },(error)=>{
      console.log(error);
    });
  }

  getHubspotProperties()
  {
    const endpoint = API.main.crmProperties.replaceAll("{{provider}}",'hubspot');
    this.restService.getAll(endpoint)
    .subscribe((response: any)=>{
      this.hubspotCRMProperties = response;
    },(error)=>{
      console.log(error);
    });
  }

  getOrgTool() {
    const endpoint = API.main.orgTool + "/name/hubspot";
    this.restService.getAll(endpoint)
      .subscribe((response: any) => {
        this.toolData = response;
        this.getAllKeyMappings();
      }, (error) => {
        console.log(error);
      });
  }

  getAllKeyMappings() {
    if (this.toolData) {
      const endpoint = API.main.crmKeyMapping.replaceAll('{{toolId}}', this.toolData.id)
      this.restService.getAll(endpoint)
        .subscribe((response: any) => {
          console.log(response);
          this.keyMappingData = response;
        }, (error) => {
          console.log(error);
          this.notifiService.showError(error.error.message);
        });
    }
  }

  openAddMaping() {
    this.mappingForm.reset();
    this.resetErrorFeedback();

    this.offcanvasService.open(this.addMappingCanvas, {
      position: 'end',
      backdrop: 'static',
      panelClass: 'visible',
      animation: true,
    });
  }

  openEditMaping(item: any) {
    this.mappingForm.reset();
    this.resetErrorFeedback();

    this.selectedMapping = item;

    this.mappingForm.patchValue(item)

    this.offcanvasService.open(this.editMappingCanvas, {
      position: 'end',
      backdrop: 'static',
      panelClass: 'visible',
      animation: true,
    });
  }

  onAddSubmit() {
    this.resetErrorFeedback();
    const fieldName = this.mappingForm.value.fieldName || "";
    const externalFieldName = this.mappingForm.value.externalFieldName || "";
    if (this.mappingForm.valid) {

      if (this.toolData) {
        const date = this.mappingForm.value;
        const endpoint = API.main.crmKeyMapping.replaceAll('{{toolId}}', this.toolData.id)
        this.restService.post(endpoint, date)
          .subscribe((response: any) => {
            this.offcanvasService.dismiss();
            console.log(response);
            this.notifiService.showSuccess("New mapping added.");
            this.getAllKeyMappings();
          }, (error) => {
            console.log(error);
            this.notifiService.showError(error.error.message);
          });
      }
    }
    else {
      if (fieldName.length <= 0) {
        this.errorFeedback.fieldName = "Field name required.";
      }
      if (externalFieldName.length <= 0) {
        this.errorFeedback.externalFieldName = "External field name name required.";
      }
    }
  }

  onEditSubmit() {
    this.resetErrorFeedback();
    const fieldName = this.mappingForm.value.fieldName || "";
    const externalFieldName = this.mappingForm.value.externalFieldName || "";
    if (this.mappingForm.valid) {

      if (this.toolData && this.selectedMapping) {
        const date = this.mappingForm.value;
        const endpoint = API.main.crmKeyMapping.replaceAll('{{toolId}}', this.toolData.id)
        this.restService.patch(endpoint, this.selectedMapping.id, date)
          .subscribe((response: any) => {
            this.offcanvasService.dismiss();
            console.log(response);
            this.notifiService.showSuccess("Mapping updated.");
            this.getAllKeyMappings();
          }, (error) => {
            console.log(error);
            this.notifiService.showError(error.error.message);
          });
      }
    }
    else {
      if (fieldName.length <= 0) {
        this.errorFeedback.fieldName = "Field name required.";
      }
      if (externalFieldName.length <= 0) {
        this.errorFeedback.externalFieldName = "External field name name required.";
      }
    }
  }

  isFieldValid(fieldName: string): boolean {
    const control = this.mappingForm.get(fieldName)!;
    return control.invalid && control.dirty;
  }

  resetErrorFeedback() {
    let keys = Object.keys(this.errorFeedback);
    for (let key of keys) {
      this.errorFeedback[key] = "";
    }
  }

  openDeleteMapping(item: any) {
    this.selectedMapping = item;
    this.sweetAlertService.warning("Delete mapping", "Are you sure you want to delete ?", ['Delete', 'Cancel'], (confirm: any) => {
      if (confirm.isConfirmed) {
        this.onDeleteMappingSubmit();
      }
    });
  }

  onDeleteMappingSubmit() {
    if (this.toolData && this.selectedMapping) {
      const endpoint = API.main.crmKeyMapping.replaceAll('{{toolId}}', this.toolData.id)
      this.restService.delete(endpoint, this.selectedMapping.id)
        .subscribe((response: any) => {
          this.getAllKeyMappings();
          this.selectedMapping = null;
          this.notifiService.showSuccess("Mapping deleted.");
        }, (error) => {
          console.log(error);
        });

    }
  }

  transformObjectToOptions(obj: any): any[] {
    const options = [];
    for (const entity in obj) {
      if (obj.hasOwnProperty(entity)) {
        for (const key in obj[entity]) {
          if (obj[entity].hasOwnProperty(key)) {
            options.push({ label: obj[entity][key], groupBy: entity });
          }
        }
      }
    }
    return options;
  }

  onConnectClick(provider: string)
  {    
    if(this.authService.getUser())
    {
      this.restService.get(API.main.oauth,provider + `?orgId=${this.authService.getUser().orgId}`)
      .subscribe((response:any)=>{
        location.href = response.redirect_url;
      },(error)=>{
        console.log(error);
      });    
    }
  }
  
}
