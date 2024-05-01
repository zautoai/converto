import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import { promises as fsPromises } from 'fs';

@Injectable()
export class FileUtilService {
  
  createOrAppendFile(fileName: string, content: string): void {
    try {
      const file = fs.appendFileSync(fileName, content);
      console.log(`Content added to ${fileName}`);
    } catch (error) {
      console.error('Error writing to file:', error);
    }
  }

  async deleteFile(filePath: string) {
    try {
        await fsPromises.unlink(filePath);
    } catch(error) {
        console.log(error);
    }
  }
}
