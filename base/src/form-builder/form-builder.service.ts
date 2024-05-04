import { Injectable } from '@nestjs/common';
import { CreateFormBuilderDto } from './dto/create-form-builder.dto';
import { UpdateFormBuilderDto } from './dto/update-form-builder.dto';
import { FormBuilderMicroService } from 'src/microservices/crm_service/form-builder.service';
import { FilterDto } from 'src/common/dto/filter.dto';
import { BaseService } from 'src/common/services/base.service';

@Injectable()
export class FormBuilderService extends BaseService{

  constructor(
    private readonly formBuilderService:FormBuilderMicroService
  ){
    super();
  }

  async create(orgId:string,createFormBuilderDto: CreateFormBuilderDto) {
    return this.handleException(await this.formBuilderService.createForm(orgId,createFormBuilderDto));
  }

  async findAll(orgId:string,filterDto:FilterDto) {
    return this.handleException(await this.formBuilderService.getForms(orgId,filterDto));
  }

  async findOne(orgId:string,id: string) {
    return this.handleException(await this.formBuilderService.getForm(orgId, id));
  }

  async update(orgId:string,id: string, updateFormBuilderDto: UpdateFormBuilderDto) {
    return this.handleException(await this.formBuilderService.updateForm(orgId,id, updateFormBuilderDto));
  }

  async remove(orgId:string,id: string) {

    return this.handleException(await this.formBuilderService.deleteForm(orgId, id));
  }

  async generateFormScript(orgId:string, id: string) {
    return this.handleException(await this.formBuilderService.generateFormScript(orgId, id));
  }

  async generateFormHTML(orgId:string, id: string) {
    return this.handleException(await this.formBuilderService.generateFormHTML(orgId, id));
  }

  async submitForm(orgId:string, id: string, formData: any) {
    return this.handleException(await this.formBuilderService.submitForm(orgId, id, formData));
  }
}
