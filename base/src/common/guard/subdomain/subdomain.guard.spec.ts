import { SubdomainGuard } from './subdomain.guard';

describe('SubdomainGuard', () => {
  it('should be defined', () => {
    expect(new SubdomainGuard()).toBeDefined();
  });
});
