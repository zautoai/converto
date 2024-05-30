import { Controller } from '@nestjs/common';
import { IcpScoreService } from './icp-score.service';

@Controller('icp-score')
export class IcpScoreController {
  constructor(private readonly icpScoreService: IcpScoreService) {}
}
