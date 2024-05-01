import { Inject, Injectable, Logger } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";


@Injectable()
export class ContactService {

    private logger = new Logger(ContactService.name);

    constructor(@Inject('CRM_SERVICE') private readonly CRMClient: ClientProxy) {}

    async getContacts(orgId: string) {
        try
        {
            return this.CRMClient.send({cmd: 'GET_CONTACTS'}, {orgId}).toPromise();
        }
        catch (error)
        {
            this.logger.error(`Error while fetching contact: ${error.message}`);
            throw error;
        }
    }

    async getContact(orgId: string,id: string) {
        try
        {
            return this.CRMClient.send({cmd: 'GET_CONTACT'}, {orgId,id}).toPromise();
        }
        catch (error)
        {
            this.logger.error(`Error while fetching contact: ${error.message}`);
            throw error;
        }
    }

    async createContact(orgId: string,contact: any) {
        try
        {
            return this.CRMClient.send({cmd: 'CREATE_CONTACT'}, {orgId,contact}).toPromise();
        }
        catch (error)
        {
            this.logger.error(`Error while creating contact: ${error.message}`);
            throw error;
        }
    }

    async updateContact(orgId: string,id: string,contact: any) {
        try
        {
            return this.CRMClient.send({cmd: 'UPDATE_CONTACT'}, {orgId,id,contact}).toPromise();
        }
        catch (error)
        {
            this.logger.error(`Error while updating contact: ${error.message}`);
            throw error;
        }
    }

    async deleteContact(orgId: string,id: string) {
        try
        {
            return this.CRMClient.send({cmd: 'DELETE_CONTACT'}, {orgId,id}).toPromise();
        }
        catch (error)
        {
            this.logger.error(`Error while deleting contact: ${error.message}`);
            throw error;
        }
    }

}