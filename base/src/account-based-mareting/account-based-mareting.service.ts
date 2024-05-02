import { Injectable } from '@nestjs/common';
import { CreateAccountBasedMaretingDto } from './dto/create-account-based-mareting.dto';
import { UpdateAccountBasedMaretingDto } from './dto/update-account-based-mareting.dto';

@Injectable()
export class AccountBasedMaretingService {
  create(createAccountBasedMaretingDto: CreateAccountBasedMaretingDto) {
    return 'This action adds a new accountBasedMareting';
  }

  findAll() {
    return `This action returns all accountBasedMareting`;
  }

  findOne(id: number) {
    return `This action returns a #${id} accountBasedMareting`;
  }

  update(id: number, updateAccountBasedMaretingDto: UpdateAccountBasedMaretingDto) {
    return `This action updates a #${id} accountBasedMareting`;
  }

  remove(id: number) {
    return `This action removes a #${id} accountBasedMareting`;
  }
}
