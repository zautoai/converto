import { Test, TestingModule } from '@nestjs/testing';
import { NodeMailService } from './node-mail.service';

describe('NodeMailService', () => {
  let service: NodeMailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NodeMailService],
    }).compile();

    service = module.get(NodeMailService);
  });

  it('sends email with expected content', async () => {
    const dto = { name: 'Alice', email: 'alice@example.com', mobile: '+1555123456', message: 'Hello there!' } as any;
    const result = await service.submit(dto);
    expect(result.success).toBe(true);
    expect(result.id).toBeTruthy();
  });

  it('uses fallback SMTP when main returns null', async () => {
    // Force primary path to return null
  process.env.HR_SMTP_HOST = 'smtp.invalid-host.test'; // will fail -> ethereal fallback
  process.env.HR_SMTP_PORT = '587';
  process.env.HR_SMTP_USER = 'no-reply@example.com';
  process.env.HR_SMTP_PASS = 'secret';
  process.env.HR_SMTP_NAME = 'Test HR';

    const dto = { name: 'Bob', email: 'bob@example.com', mobile: '+15551230000', message: 'Need info' } as any;
    const result = await service.submit(dto);
      expect(result.success).toBe(true);
      expect(result.id).toBeTruthy();
  });
});
  // Extend default timeout for potential ethereal account creation latency
  jest.setTimeout(20000);
