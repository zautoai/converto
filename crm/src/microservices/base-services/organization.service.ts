import { Inject, Injectable, Logger } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { PaginationDto } from "src/common/dtos/pagination.dto";

@Injectable()
export class OrganizationService {
  private logger = new Logger(OrganizationService.name);

  constructor(@Inject('BASE_SERVICE') private readonly baseServiceClient: ClientProxy) {}

  async getOrganizations(paginationDto: PaginationDto) {
    try {
      return await this.baseServiceClient.send({ cmd: 'GET_ORGANIZATIONS' }, paginationDto).toPromise();
    } catch (error) {
      this.logger.error(`Error while fetching organizations: ${error.message}`);
      throw error;
    }
  }

  async getOrganizationById(id: string) {
    try {
      return await this.baseServiceClient.send({ cmd: 'GET_ORGANIZATION' }, { id }).toPromise();
    } catch (error) {
      this.logger.error(`Error while fetching organization by ID ${id}: ${error.message}`);
      throw error;
    }
  }

  async createOrganization(organization: any) {
    try {
      return await this.baseServiceClient.send({ cmd: 'CREATE_ORGANIZATION' }, {organization}).toPromise();
    } catch (error) {
      this.logger.error(`Error while creating organization: ${error.message}`);
      throw error;
    }
  }

  async updateOrganization(organization: any) {
    try {
      return await this.baseServiceClient.send({ cmd: 'UPDATE_ORGANIZATION' }, {organization}).toPromise();
    } catch (error) {
      this.logger.error(`Error while updating organization: ${error.message}`);
      throw error;
    }
  }

  async deleteOrganization(id: string) {
    try {
      return await this.baseServiceClient.send({ cmd: 'DELETE_ORGANIZATION' }, { id }).toPromise();
    } catch (error) {
      this.logger.error(`Error while deleting organization with ID ${id}: ${error.message}`);
      throw error;
    }
  }
}
