import { Injectable } from '@nestjs/common';
import * as CryptoJS from 'crypto-js';

@Injectable()
export class HashingService {


    encryt(text: string) {
        return CryptoJS.AES.encrypt(text, process.env.CRYPTO_ENCRYPTION_SECRET).toString();
    }

    decrypt(hashedText: string) {
        return CryptoJS.AES.decrypt(hashedText, process.env.CRYPTO_ENCRYPTION_SECRET).toString(CryptoJS.enc.Utf8);
    }
}


