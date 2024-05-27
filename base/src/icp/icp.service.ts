import { Injectable } from '@nestjs/common';
import { CreateIcpDto } from './dto/create-icp.dto';
import { UpdateIcpDto } from './dto/update-icp.dto';
import { BaseService } from 'src/common/services/base.service';
import { IcpMicroService } from 'src/microservices/crm_service/icp.service';

@Injectable()
export class IcpService extends BaseService {

  constructor(private readonly icpService: IcpMicroService) {
    super();
  }

  async create(orgId: string, createIcpDto: CreateIcpDto) {
    return this.handleException(
      await this.icpService.createIcp(orgId, createIcpDto),
    );
  }

  async findAll(orgId: string) {
    return this.handleException(
      await this.icpService.getIcps(orgId),
    );
  }

  async findOne(orgId: string, id: string) {
    return this.handleException(
      await this.icpService.getIcp(orgId, id),
    );
  }

  async update(orgId: string, id: string, updateIcpDto: UpdateIcpDto) {
    return this.handleException(
      await this.icpService.updateIcp(orgId, id, updateIcpDto),
    );
  }

  async remove(orgId: string, id: string) {
    return this.handleException(
      await this.icpService.deleteIcp(orgId, id),
    );
  }
}
