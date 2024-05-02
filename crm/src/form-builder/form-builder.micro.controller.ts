import { Controller } from "@nestjs/common";
import { FormBuilderService } from "./form-builder.service";
import { MessagePattern } from "@nestjs/microservices";


@Controller()
export class FormBuilderMicroserviceController {

    constructor(
        private readonly formBuilderService: FormBuilderService
    ) {}

    @MessagePattern({ cmd: 'CREATE_FORM' })
    async createForm(data: any) {
        try
        {
            return await this.formBuilderService.create(data.orgId,data.form);
        }
        catch (error) {
            return error.response || error;
        }
    }

    @MessagePattern({ cmd: 'GET_FORMS' })
    async getForms(data: any) {
        try
        {
            return await this.formBuilderService.findAll(data.orgId,data.filterDto);
        }
        catch (error)
        {
            return error.response || error;
        }
    }

    @MessagePattern({ cmd: 'GET_FORM' })
    async getForm(data: any) {
        try
        {
            return await this.formBuilderService.findOne(data.orgId, data.id);
        }
        catch (error)
        {
            return error.response || error;
        }
    }

    @MessagePattern({ cmd: 'UPDATE_FORM' })
    async updateForm(data: any) {
        try
        {
            return await this.formBuilderService.update(data.orgId, data.id, data.form);
        }
        catch (error)
        {
            return error.response || error;
        }
    }

    @MessagePattern({ cmd: 'DELETE_FORM' })
    async deleteForm(data: any) {
        try
        {
            return await this.formBuilderService.remove(data.orgId, data.id);
        }
        catch (error)
        {
            return error.response || error;
        }
    }

    @MessagePattern({ cmd: 'GET_FORM_SCRIPT' })
    async getFormScript(data: any) {
        try
        {
            return await this.formBuilderService.generateFormScript(data.orgId, data.id);
        }
        catch (error)
        {
            return error.response || error;
        }
    }

    @MessagePattern({ cmd: 'GET_FORM_HTML' })
    async getFormHtml(data: any) {
        try
        {
            return await this.formBuilderService.generateFormHTML(data.orgId, data.id);
        }
        catch (error)
        {
            return error.response || error;
        }
    }

    @MessagePattern({ cmd: 'FORM_SUBMIT' })
    async getFormSubmit(data: any) {
        try
        {
            return await this.formBuilderService.submitForm(data.orgId, data.id, data.formData);
        }
        catch (error)
        {
            return error.response || error;
        }
    }

}