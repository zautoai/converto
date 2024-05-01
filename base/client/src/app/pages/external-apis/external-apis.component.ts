import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { API } from 'src/app/config/endpoint.config';
import { RestService } from 'src/app/shared/services/rest.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthType, HttpMethod } from 'src/app/common/enums';
import { SweetAlertService } from 'src/app/shared/services/sweet-alart.service';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { ActivatedRoute, Router } from '@angular/router';
import { isNotEmpty, transformObjectToOptions } from 'src/app/common/utils';
import { ScrollUtilService } from 'src/app/shared/services/scroll-util.service';

@Component({
  selector: 'app-external-apis',
  templateUrl: './external-apis.component.html',
  styleUrls: ['./external-apis.component.scss']
})
export class ExternalApisComponent implements OnInit, AfterViewInit {

  zautoCRMProperties: any = {};
  externalApiProperties: any = {};
  externalApiData: any = null;
  selectedApi: any = null;
  selectedMapping: any = null;
  externalApiForm: FormGroup;
  keymappingForm: FormGroup;
  authTypeOptions: string[] = Object.values(AuthType);
  httpMethodOptions: string[] = Object.values(HttpMethod);
  errorFeedback: any = { name: "", username: '', description: '', password: '', header: '', token: '', url: '', fieldName: '', externalFieldName: '' };

  currentPage: number = 1;
  itemPerPage: number = 25;

  @ViewChild('createExternalAPIOffcanvas', { static: false }) createExternalAPIOffcanvas: ElementRef | any;
  @ViewChild('editExternalAPIOffcanvas', { static: false }) editExternalAPIOffcanvas: ElementRef | any;
  @ViewChild('addKeyMappingOffcanvas', { static: false }) addKeyMappingOffcanvas: ElementRef | any;
  @ViewChild('editKeyMappingOffcanvas', { static: false }) editKeyMappingOffcanvas: ElementRef | any;

  @ViewChild('scrollContainer') scrollContainer!: ElementRef;

  constructor(
    private readonly router: ActivatedRoute,
    private readonly route: Router,
    private readonly restService: RestService,
    private readonly offcanvasService: NgbOffcanvas,
    private readonly formBuilder: FormBuilder,
    private readonly notifService: NotificationService,
    private readonly sweetAlertService: SweetAlertService,
    private scrollService: ScrollUtilService
  ) {
    this.externalApiForm = this.formBuilder.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      authType: [AuthType.NONE, Validators.required],
      username: [''],
      password: [''],
      header: [''],
      token: [''],
      url: ['', Validators.required],
      method: [HttpMethod.POST, Validators.required],
    });

    this.keymappingForm = this.formBuilder.group({
      fieldName: ['', Validators.required],
      externalFieldName: ['', Validators.required],
    })
  }

  ngOnInit(): void {
    this.getZautoProperties();
    this.getAllExternalApis();
  }

  ngAfterViewInit(): void {
    const containerElement = this.scrollContainer.nativeElement;

    this.scrollService.containerReachedBottom(containerElement)
      .subscribe({
        next: (reachedBottom) => {
          if (reachedBottom) {
            this.onScrolledBottom();
          }
        }
      });
    this.scrollService.containerReachedTop(containerElement)
      .subscribe({
        next: (reachedTop) => {
          if (reachedTop) {
          }
        }
      });

  }

  private getAllExternalApis() {
    this.restService.getAll(API.main.externalApi)
      .subscribe({
        next: (response: any) => {
          if (this.externalApiData?.data) {
            const newData = response.data.filter((item: any) => !this.externalApiData.data.some((existingItem: any) => existingItem.id === item.id));
            this.externalApiData.data = this.externalApiData.data.concat(newData);

            this.externalApiData.total = response.total;
            this.externalApiData.page = response.page;
          }
          else {
            this.externalApiData = response;
            console.log(response);

          }
          const apiId = this.router.snapshot.params['id'];
          if (apiId) {
            this.getSelectedAPI(apiId);
          }

        },
        error: (error) => {
          console.log(error);
          this.notifService.showError(error.error.message);
        }
      });
  }

  selectApi(apiData: any) {
    const queryParams = this.router.snapshot.queryParams;
    this.route.navigate(['/external-apis', apiData?.id], { queryParams: queryParams });
    this.getSelectedAPI(apiData?.id);
  }

  getSelectedAPI(id: string) {
    this.restService.get(API.main.externalApi, id).subscribe({
      next: (response: any) => {
        this.selectedApi = response;
      },
      error: (error: any) => {
        this.notifService.showError(error.error.message);
      }
    });
  }

  openCreateExternalAPI() {
    this.resetErrorFeedback();
    this.externalApiForm.reset();
    this.externalApiForm.get('authType')?.setValue(AuthType.NONE);
    this.externalApiForm.get('method')?.setValue(HttpMethod.POST);
    this.offcanvasService.open(this.createExternalAPIOffcanvas, {
      position: 'end',
      backdrop: 'static',
      panelClass: 'visible',
      animation: true,
    });
  }

  openEditExternalAPI() {
    if (!this.selectedApi) {
      return;
    }
    this.resetErrorFeedback();
    this.externalApiForm.reset();
    this.externalApiForm.patchValue(this.selectedApi);
    this.offcanvasService.open(this.editExternalAPIOffcanvas, {
      position: 'end',
      backdrop: 'static',
      panelClass: 'visible',
      animation: true,
    });
  }

  openDeleteExternalAPI() {
    this.sweetAlertService.warning("Delete API", "Are you sure you want to delete ?", ['Delete', 'Cancel'], (confirm: any) => {
      if (confirm.isConfirmed) {
        this.onDeleteAPISubmit();
      }
    });
  }

  onCreateExternalAPISubmit() {
    this.resetErrorFeedback();
    const name = this.externalApiForm.value.name || "";
    const description = this.externalApiForm.value.description || "";
    const authType = this.externalApiForm.value.authType || "";
    const username = this.externalApiForm.value.username || "";
    const password = this.externalApiForm.value.password || "";
    const token = this.externalApiForm.value.token || "";
    const url = this.externalApiForm.value.url || "";
    const method = this.externalApiForm.value.method || "";
    const header = this.externalApiForm.value.header || "";


    if (this.externalApiForm.valid &&
      !(authType == AuthType.BASIC && !isNotEmpty(username, password)) &&
      !(authType == AuthType.TOKEN && !isNotEmpty(header, token))) {
      const payload = {
        name,
        authType,
        description,
        ...authType == AuthType.BASIC ? { username, password } : {},
        ...authType == AuthType.TOKEN ? { header, token } : {},
        url,
        method
      }
      this.restService.post(API.main.externalApi, payload)
        .subscribe({
          next: (resposne: any) => {
            this.getAllExternalApis();
            this.offcanvasService.dismiss();
          },
          error: (error) => {
            this.notifService.showError(error.error.message);
          }
        });
    }
    else {
      if (name.length <= 0) {
        this.errorFeedback.name = 'Name required.';
      }
      if (description.length <= 0) {
        this.errorFeedback.description = 'Description required.';
      }
      if (username.length <= 0 && authType == AuthType.BASIC) {
        this.errorFeedback.username = 'Username required.';
      }
      if (password.length <= 0 && authType == AuthType.BASIC) {
        this.errorFeedback.password = 'Password required.';
      }
      if (token.length <= 0 && authType == AuthType.TOKEN) {
        this.errorFeedback.token = 'Token required.';
      }
      if (url.length <= 0) {
        this.errorFeedback.url = 'Url required.';
      }
      if (header.length <= 0 && authType == AuthType.TOKEN) {
        this.errorFeedback.header = 'Header required.';
      }

    }
  }


  onEditExternalAPISubmit() {
    this.resetErrorFeedback();
    const name = this.externalApiForm.value.name || "";
    const description = this.externalApiForm.value.description || "";
    const authType = this.externalApiForm.value.authType || "";
    const username = this.externalApiForm.value.username || "";
    const password = this.externalApiForm.value.password || "";
    const token = this.externalApiForm.value.token || "";
    const url = this.externalApiForm.value.url || "";
    const method = this.externalApiForm.value.method || "";
    const header = this.externalApiForm.value.header || "";

    if (this.externalApiForm.valid &&
      !(authType == AuthType.BASIC && !isNotEmpty(username, password)) &&
      !(authType == AuthType.TOKEN && !isNotEmpty(header, token))) {
      if (!this.selectedApi) {
        return;
      }
      const payload = {
        name,
        authType,
        description,
        ...authType == AuthType.BASIC ? { username, password } : {},
        ...authType == AuthType.TOKEN ? { header, token } : {},
        url,
        method
      }
      this.restService.patch(API.main.externalApi, this.selectedApi.id, payload)
        .subscribe({
          next: (resposne: any) => {
            this.getAllExternalApis();
            this.offcanvasService.dismiss();

          },
          error: (error) => {
            this.notifService.showError(error.error.message);
          }
        });
    }
    else {
      if (name.length <= 0) {
        this.errorFeedback.name = 'Name required.';
      }
      if (description.length <= 0) {
        this.errorFeedback.description = 'Description required.';
      }
      if (username.length <= 0 && authType == AuthType.BASIC) {
        this.errorFeedback.username = 'Username required.';
      }
      if (password.length <= 0 && authType == AuthType.BASIC) {
        this.errorFeedback.password = 'Password required.';
      }
      if (token.length <= 0 && authType == AuthType.TOKEN) {
        this.errorFeedback.token = 'Token required.';
      }
      if (url.length <= 0) {
        this.errorFeedback.url = 'Url required.';
      }
      if (header.length <= 0 && authType == AuthType.TOKEN) {
        this.errorFeedback.header = 'Header required.';
      }

    }
  }

  onDeleteAPISubmit() {
    if (!this.selectedApi) {
      return;
    }
    this.restService.delete(API.main.externalApi, this.selectedApi.id)
      .subscribe({
        next: (response: any) => {
          // console.log(response);
          // this.getAllExternalApis();
          this.route.navigate(['/external-apis']);
        },
        error: (error) => {
          console.log(error);
          this.notifService.showError(error.error.message);
        }
      });
  }

  isFieldValid(formGroup: FormGroup, fieldName: string): boolean {
    const control = formGroup.get(fieldName)!;
    return control.invalid && control.dirty;
  }

  resetErrorFeedback() {
    let keys = Object.keys(this.errorFeedback);
    for (let key of keys) {
      this.errorFeedback[key] = "";
    }
  }

  getZautoProperties() {
    const endpoint = API.main.crmProperties.replaceAll("{{provider}}", 'zauto');
    this.restService.getAll(endpoint)
      .subscribe((response: any) => {
        this.zautoCRMProperties = transformObjectToOptions(response);
      }, (error) => {
        console.log(error);
      });
  }

  openAddkeymapping() {
    this.resetErrorFeedback();
    this.keymappingForm.reset();
    this.offcanvasService.open(this.addKeyMappingOffcanvas, {
      position: 'end',
      backdrop: 'static',
      panelClass: 'visible',
      animation: true,
    });
  }

  openEditkeymapping(mapping: any) {
    this.resetErrorFeedback();
    this.selectedMapping = mapping;
    this.keymappingForm.reset();
    this.keymappingForm.patchValue(mapping);
    this.offcanvasService.open(this.editKeyMappingOffcanvas, {
      position: 'end',
      backdrop: 'static',
      panelClass: 'visible',
      animation: true,
    });
  }

  onAddKeyMapSubmit() {
    this.resetErrorFeedback();
    const fieldName = this.keymappingForm.value.fieldName || "";
    const externalFieldName = this.keymappingForm.value.externalFieldName || "";

    if (this.keymappingForm.valid) {
      if (!this.selectedApi) {
        return;
      }
      const payload = {
        fieldName,
        externalFieldName
      };
      const endpoint = API.main.externalApiKeymapping.replaceAll('{{externalApiId}}', this.selectedApi.id);
      this.restService.post(endpoint, payload)
        .subscribe({
          next: (response: any) => {
            this.getSelectedAPI(this.selectedApi.id);
            this.offcanvasService.dismiss();
          },
          error: (error) => {
            console.log(error);
            this.notifService.showError(error.error.message);
          }
        });
    }
    else {
      if (fieldName.length <= 0) {
        this.errorFeedback.fieldName = 'Field name required.';
      }
      if (externalFieldName.length <= 0) {
        this.errorFeedback.externalFieldName = 'External field name required.';
      }
    }
  }

  onEditKeyMapSubmit() {
    this.resetErrorFeedback();
    const fieldName = this.keymappingForm.value.fieldName || "";
    const externalFieldName = this.keymappingForm.value.externalFieldName || "";

    if (this.keymappingForm.valid) {
      if (!this.selectedApi || !this.selectedMapping) {
        return;
      }
      const payload = {
        fieldName,
        externalFieldName
      };
      const endpoint = API.main.externalApiKeymapping.replaceAll('{{externalApiId}}', this.selectedApi.id);
      this.restService.patch(endpoint, this.selectedMapping.id, payload)
        .subscribe({
          next: (response: any) => {
            this.getSelectedAPI(this.selectedApi.id);
            this.offcanvasService.dismiss();
          },
          error: (error) => {
            console.log(error);
            this.notifService.showError(error.error.message);
          }
        });
    }
    else {
      if (fieldName.length <= 0) {
        this.errorFeedback.fieldName = 'Field name required.';
      }
      if (externalFieldName.length <= 0) {
        this.errorFeedback.externalFieldName = 'External field name required.';
      }
    }
  }

  openDeleteKeyMap(mapping: any) {
    this.selectedMapping = mapping;
    this.sweetAlertService.warning("Delete KeyMapping", "Are you sure you want to delete ?", ['Delete', 'Cancel'], (confirm: any) => {
      if (confirm.isConfirmed) {
        this.onDeleteKeyMapSubmit()
      }
    });
  }

  onDeleteKeyMapSubmit() {

    if (!this.selectedApi || !this.selectedMapping) {
      return;
    }
    const endpoint = API.main.externalApiKeymapping.replaceAll('{{externalApiId}}', this.selectedApi.id);
    this.restService.delete(endpoint, this.selectedMapping.id)
      .subscribe({
        next: (response: any) => {
          console.log(response);
          this.getAllExternalApis();
        },
        error: (error) => {
          console.log(error);
          this.notifService.showError(error.error.message);
        }
      });
  }

  onScrolledBottom() {
    const totalCount = this.externalApiData?.total;
    const itemPerPage = this.itemPerPage;

    if (totalCount && itemPerPage) {
      const maxPage = Math.ceil(totalCount / itemPerPage);
      if (this.currentPage < maxPage) {
        this.currentPage++;
        this.getAllExternalApis();
      }
    } else {
      console.error('Total count or items per page not available');
    }
  }
}
