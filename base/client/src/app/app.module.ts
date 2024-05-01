import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { OverlayModule } from "@angular/cdk/overlay";
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SharedModule } from './shared/shared.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import {  HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { NgHttpLoaderModule } from 'ng-http-loader';


@NgModule({
  declarations:[
    AppComponent,
  ],
  imports: [
  CommonModule,
  BrowserModule,
  HttpClientModule,
  AppRoutingModule,
    SharedModule,
    NgbModule,
    BrowserAnimationsModule,
    OverlayModule,
    ToastrModule.forRoot({

    }),
    FormsModule,
    NgHttpLoaderModule.forRoot(),
  ],
  exports:[
    
  ],
  providers:[

  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  bootstrap: [AppComponent]
})
export class AppModule { }

