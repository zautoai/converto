import { VerificationType } from "src/common/enums/enums";
import { User } from "src/users/entities/user.entity";


export class Verification {

    id: string;

    user: User;

    token: string;

    type: string

    createdAt: Date;

    modifiedAt: Date;
}