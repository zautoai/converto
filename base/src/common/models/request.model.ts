import { User } from "src/users/entities/user.entity";


export class ZautoRequest {

    user: User;
    orgId: string;
    body: any;
}