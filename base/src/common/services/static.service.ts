import { Injectable } from "@nestjs/common";
import { promises as fsPromises } from 'fs';

@Injectable()
export class StaticFileService {

    async deleteExistingFile(link: string) {
        try {
            if(link && link.includes(process.env.HOST_URL)) {
                const imgPath = `./public${link.replace(process.env.HOST_URL, '')}`;
                await fsPromises.unlink(imgPath);
            } else {
                await fsPromises.unlink(link);
            }
        } catch(error) {
            console.log(error);
        }
    }
}