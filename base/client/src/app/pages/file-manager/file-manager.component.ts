import { Component, OnInit } from '@angular/core';
import { API } from 'src/app/config/endpoint.config';
import { RestService } from 'src/app/shared/services/rest.service';
import { SweetAlertService } from 'src/app/shared/services/sweet-alart.service';

@Component({
  selector: 'app-file-manager',
  templateUrl: './file-manager.component.html',
  styleUrls: ['./file-manager.component.scss']
})
export class FileManagerComponent implements OnInit{

  filesData:any = null;
  files: File[] = [];
  isUploading:boolean = false;

  constructor(
    private readonly restService:RestService,
    private sweetAlertService: SweetAlertService,
  ){}

  ngOnInit(): void {
    this.getAllFiles();    
  }

  getAllFiles()
  {
    this.restService.getAll(API.main.fileManager)
    .subscribe({
      next:(response:any)=>{
        this.filesData = response;        
      },
      error:(error)=>{
        console.log(error);
      }
    });
  }

  getFileExtension(fileName:string)
  {
    const dotIndex = fileName.lastIndexOf('.');
    if (dotIndex === -1 || dotIndex === fileName.length - 1) {
        return '';
    }
    const extension = fileName.substring(dotIndex + 1);
    return extension;
  }

  onFileSelect(event:any) {
    this.files.push(...event.addedFiles);
    console.log(this.files);
  }
  
  onFileRemove(event:any) {
    console.log(event);
    this.files.splice(this.files.indexOf(event), 1);
  }

  onUploadSubmit()
  {
    if(this.files.length > 0)
    {
      const formData = new FormData();
      for(const file of this.files)
      {
        formData.append('files', file);
      }
      this.isUploading = true;
      this.restService.uploadFile(API.main.fileManager,formData)
      .subscribe({
        next:(response:any)=>{
          this.getAllFiles();
          this.files.splice(0,this.files.length);
          this.isUploading = false;
        },
        error:(error)=>{
          console.log(error);
          this.isUploading = false;
        }
      });
    }
  }

  onDeleteFile(file:any)
  {
    this.sweetAlertService.warning("Delete File","Are you sure you want to delete "+ file?.fileName + " ?",['Delete','Cancel'],(confirm:any)=>{
      if(confirm.isConfirmed)
      {
        this.onFileDeleteSubmit(file.id)
      }
    });
    
  }

  onFileDeleteSubmit(fileId:string)
  {
    if(!fileId) return;
    this.restService.delete(API.main.fileManager,fileId)
    .subscribe({
      next:(response:any)=>{
        this.getAllFiles();
      },
      error:(error)=>{
        console.log(error);
      }
    });
  }
}
