import { Component, OnInit } from '@angular/core';
import * as e from 'express';
import { API } from 'src/app/config/endpoint.config';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { RestService } from 'src/app/shared/services/rest.service';

interface configForm {
  host: string | null;
  port: number | null;
  user: string | null;
  pass: string | null;
  name: string | null;
}

@Component({
  selector: 'app-smtpconfig',
  templateUrl: './smtpconfig.component.html',
  styleUrls: ['./smtpconfig.component.scss']
})
export class SMTPConfigComponent implements OnInit {

  smtpConfigData: any = null;
  originalConfigData: any = null;
  canEdit: boolean = false;
  isUpdateing: boolean = false;

  configForm: configForm = { host: "", port: null, user: "", pass: "", name: "" };

  constructor(
    private restService: RestService,
    private notifService: NotificationService
  ) {
  }

  ngOnInit(): void {
    this.getSMTPConfig();
  }

  getSMTPConfig() {
    this.restService.getAll(API.main.orgSmtpConfig)
      .subscribe((response: any) => {
        if (response.data.length > 0) {
          this.smtpConfigData = response.data[0];
          this.smtpConfigData.pass = "";
          this.originalConfigData = { ...this.smtpConfigData };
          this.configForm = { ...this.smtpConfigData };
        }

      }, (error) => {
        console.log(error);
        this.notifService.showError(error.error.message);
      });
  }

  toggleEdit() {
    this.canEdit = !this.canEdit;
    if (!this.canEdit) {
      this.configForm = { ...this.originalConfigData };
    }
  }

  getIsChanged() {
    return JSON.stringify(this.originalConfigData) === JSON.stringify(this.configForm);
  }

  onSaveSubmit() {
    console.log("working")
    if (this.configForm.host != "" &&
      this.configForm.port != null &&
      this.configForm.user != "" &&
      this.configForm.name != "") {
      if (this.smtpConfigData) {
        // update
        const payload: any = this.configForm;
        if (this.configForm.pass == "") {
          delete payload?.pass;
        }
        this.isUpdateing = true;
        this.restService.patch(API.main.orgSmtpConfig, this.smtpConfigData.id, payload)
          .subscribe((response: any) => {
            this.smtpConfigData = response;
            this.smtpConfigData.pass = "";
            this.originalConfigData = { ...this.smtpConfigData };
            this.configForm = { ...this.smtpConfigData };
            this.isUpdateing = false;
            this.toggleEdit();
            this.notifService.showSuccess("SMTP config updated");

          }, (error) => {
            this.isUpdateing = false;
            console.log(error);
            this.notifService.showError(error.error.message);
          });

      }
      else {
        // create
        console.log("creating...")
        const payload = this.configForm;
        this.isUpdateing = true;
        this.restService.post(API.main.orgSmtpConfig, payload)
          .subscribe((response: any) => {
            this.smtpConfigData = response;
            this.smtpConfigData.pass = "";
            this.originalConfigData = { ...this.smtpConfigData };
            this.configForm = { ...this.smtpConfigData };
            this.toggleEdit();
            this.isUpdateing = false;
            this.notifService.showSuccess("SMTP config updated");

          }, (error) => {
            this.isUpdateing = false;
            console.log(error);
            this.notifService.showError(error.error.message);
          });
      }
    }
  }

}
