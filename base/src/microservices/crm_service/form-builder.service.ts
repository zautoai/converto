import { Inject, Injectable, Logger } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";

@Injectable()
export class FormBuilderMicroService {

    private logger = new Logger(FormBuilderMicroService.name);

    constructor(@Inject('CRM_SERVICE') private readonly CRMClient: ClientProxy) {}

    async createForm(orgId:string,form: any) {
        try
        {
            this.logger.log(`Creating form: ${JSON.stringify(form)}`);
            return this.CRMClient.send({ cmd: 'CREATE_FORM' }, {orgId,form}).toPromise();
        }
        catch (error)
        {
            this.logger.error(`Error while creating form: ${error.message}`);
            throw error;
        }
    }

    async getForm(orgId: string, id: string) {
        try
        {
            return this.CRMClient.send({ cmd: 'GET_FORM' }, { orgId, id }).toPromise();
        }
        catch (error)
        {
            this.logger.error(`Error while getting form: ${error.message}`);
            throw error;
        }
    }

    async getForms(orgId: string) {
        try
        {
            return this.CRMClient.send({ cmd: 'GET_FORMS' }, {orgId}).toPromise();
        }
        catch (error)
        {
            this.logger.error(`Error while getting forms: ${error.message}`);
            throw error;
        }
    }

    async deleteForm(orgId: string, id: string) {
        try
        {
            return this.CRMClient.send({ cmd: 'DELETE_FORM' }, { orgId, id }).toPromise();
        }
        catch (error)
        {
            this.logger.error(`Error while deleting form: ${error.message}`);
            throw error;
        }
    }

    async updateForm(orgId: string, id: string, form: any) {
        try
        {
            return this.CRMClient.send({ cmd: 'UPDATE_FORM' }, { orgId, id, form }).toPromise();
        }
        catch (error)
        {
            this.logger.error(`Error while updating form: ${error.message}`);
            throw error;
        }
    }   

    async generateFormScript(orgId: string, id: string)
    {
        try
        {
            return this.CRMClient.send({ cmd: 'GET_FORM_SCRIPT' }, { orgId, id }).toPromise();
        }
        catch (error)
        {
            this.logger.error(`Error while generating form script: ${error.message}`);
            throw error;
        }
    }

    async generateFormHTML(orgId: string, id: string) {
        try
        {
            return this.CRMClient.send({ cmd: 'GET_FORM_HTML' }, { orgId, id }).toPromise();
        }
        catch (error)
        {
            this.logger.error(`Error while generating form HTML: ${error.message}`);
            throw error;
        }
    }

    async submitForm(orgId: string, id: string, formData: any) {
        try
        {
            return this.CRMClient.send({ cmd: 'SUBMIT_FORM' }, { orgId, id, formData }).toPromise();
        }
        catch (error)
        {
            this.logger.error(`Error while submitting form: ${error.message}`);
            throw error;
        }
    }

}