import { Request } from 'express';

export class SubdomainRequest extends Request{

    orgId: string;
    body: any;
}