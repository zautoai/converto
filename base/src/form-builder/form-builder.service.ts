import { Injectable } from '@nestjs/common';
import { CreateFormBuilderDto } from './dto/create-form-builder.dto';
import { UpdateFormBuilderDto } from './dto/update-form-builder.dto';
import { FormBuilderMicroService } from 'src/microservices/crm_service/form-builder.service';

@Injectable()
export class FormBuilderService {

  constructor(
    private readonly formBuilderService:FormBuilderMicroService
  ){}

  async create(orgId:string,createFormBuilderDto: CreateFormBuilderDto) {
    return await this.formBuilderService.createForm(orgId,createFormBuilderDto);
  }

  async findAll(orgId:string,) {
    return await this.formBuilderService.getForms(orgId);
  }

  async findOne(orgId:string,id: string) {
    return await this.formBuilderService.getForm(orgId, id);
  }

  async update(orgId:string,id: string, updateFormBuilderDto: UpdateFormBuilderDto) {
    return await this.formBuilderService.updateForm(orgId,id, updateFormBuilderDto);
  }

  async remove(orgId:string,id: string) {

    return await this.formBuilderService.deleteForm(orgId, id);
  }

  async generateFormScript(orgId:string, id: string) {
    return await this.formBuilderService.generateFormScript(orgId, id);
  }

  async generateFormHTML(orgId:string, id: string) {
    return await this.formBuilderService.generateFormHTML(orgId, id);
  }

  async submitForm(orgId:string, id: string, formData: any) {
    return await this.formBuilderService.submitForm(orgId, id, formData);
  }
}
