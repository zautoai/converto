import { BadRequestException, Injectable } from '@nestjs/common';
import { IEnrichment } from '../interfaces/enrichment.interface';
import { Client } from 'clearbit';

@Injectable()
export class ClearBitService implements IEnrichment {
  api_key: string;
  clearbit: Client;

  constructor() {
    this.api_key =
      process.env.CLEARBIT_API_KEY ||
      'oSy9XPEWJz_oeaXL4zvGNtIZ1cwQrAY6RCPqbjBc0Gho';
    this.clearbit = new Client({ key: this.api_key });
  }
  async getPeople(matchRequest: { [key: string]: string }): Promise<IContact> {
    try {
      const person = await this.clearbit.Person;
      const response = await person.find(matchRequest);
      return this.handlePersonResponse(response);
    } catch (error) {
      console.error(error);
      throw new BadRequestException(
        error.message || 'Something went wrong. Please try again later.',
      );
    }
  }
  async getOrganization(matchRequest: {
    [key: string]: string;
  }): Promise<IOrganization> {
    try {
      const company = await this.clearbit.Company;
      const response = await company.find(matchRequest);
      return this.handleOrganizationResponse(response);
    } catch (error) {
      console.error(error);
      throw new BadRequestException(
        error.message || 'Something went wrong. Please try again later.',
      );
    }
  }

  handlePersonResponse(response: any): IContact {
    throw new Error('Method not implemented.');
  }

  handleOrganizationResponse(response: any): IOrganization {
    throw new Error('Method not implemented.');
  }
}
