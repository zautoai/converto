import { Injectable, OnModuleInit } from '@nestjs/common';
import { WebClientService } from 'src/common/services/web-client.service';
import { CreateContactDto } from './dto/create-contacts.dto';
import { UpdateContactDto } from './dto/update-contact.dto';

@Injectable()
export class CrmService implements OnModuleInit {
  constructor(private readonly webClient: WebClientService) {}

  onModuleInit() {
    // this.getContacts('a681fa64-12a7-4c9f-940a-3a6fcbe9eb36');
  }

  //   Schema manger

  async createSchemaForOrg(orgId: string, payload: any) {
    const token = await this.getToken(orgId);
    try {
      const url = process.env.CRM_BASE_URL + `/api/v1/schema-manager`;
      const response = await this.webClient.post(url, payload, {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      });
      console.log(response);
      return response;
    } catch (error) {
      console.log(error);
    }
  }

  async deleteSchemaForOrg(orgId: string) {
    const token = await this.getToken(orgId);
    try {
      const url = process.env.CRM_BASE_URL + `/api/v1/schema-manager`;
      const response = await this.webClient.delete(url, {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      });
      console.log(response);
      return response;
    } catch (error) {
      console.log(error);
    }
  }

  async getContacts(orgId: string) {
    try {
      const token = await this.getToken(orgId);
      const url = process.env.CRM_BASE_URL + `/api/v1/contacts`;
      const response = await this.webClient.get(url, {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      });
      return response;
    } catch (err) {
      console.log(err);
    }
  }

  async getContact(orgId: string, id: string) {
    try {
      const token = await this.getToken(orgId);
      const url = process.env.CRM_BASE_URL + `/api/v1/contacts/${id}`;
      const response = await this.webClient.get(url, {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      });
      return response;
    } catch (err) {
      console.log(err);
    }
  }

  async createContact(orgId: string, createContactDto: CreateContactDto) {
    const token = await this.getToken(orgId);
    try {
      const url = process.env.CRM_BASE_URL + `/api/v1/contacts`;
      const response = await this.webClient.post(url, createContactDto, {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      });
      return response;
    } catch (error) {
      console.log(error);
    }
  }

  async updateContact(
    orgId: string,
    id: string,
    updateContactDto: UpdateContactDto,
  ) {
    const token = await this.getToken(orgId);
    try {
      const url = process.env.CRM_BASE_URL + `/api/v1/contacts/${id}`;
      const response = await this.webClient.put(url, updateContactDto, {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      });
      return response;
    } catch (error) {
      console.log(error);
    }
  }

  async deleteContact(orgId: string, id: string) {
    const token = await this.getToken(orgId);
    try {
      const url = process.env.CRM_BASE_URL + `/api/v1/contacts/${id}`;
      const response = await this.webClient.delete(url, {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      });
      return response;
    } catch (error) {
      console.log(error);
    }
  }

  async getToken(orgId: string) {
    const accessToken = process.env.CRM_ACCESS_TOKEN;
    try {
      const url =
        process.env.CRM_BASE_URL + `/api/v1/secure-exchange/exchange-token`;
      const response = await this.webClient.post(
        url,
        {
          secretKey: accessToken,
          orgId: orgId,
        },
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        },
      );
      // console.log('token is ' + response.token);
      return response.token;
    } catch (err) {
      console.log(err);
    }
  }

  async verifyToken(token: string) {
    try {
      const url =
        process.env.CRM_BASE_URL +
        `/api/v1/secure-exchange/verify-token?token=${token}`;
      const response = await this.webClient.get(url, {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      });
      return response;
    } catch (err) {
      console.log(err);
    }
  }

  //   Schema manger (end
}
