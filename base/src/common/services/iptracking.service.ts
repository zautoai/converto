import { Injectable } from "@nestjs/common";
import IPData from 'ipdata';

@Injectable()
export class IPTrackingService {
    
    async getIPData(ip: string) {
        try {
            const ipdata = new IPData(process.env.IP_DATA_KEY);
            const info = await ipdata.lookup(ip);
            console.log(info)
            return info;
        } catch(error) {
            console.log(error)
        }
    }
}