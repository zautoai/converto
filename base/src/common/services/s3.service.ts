import { Injectable, Logger } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import { ConfigService } from '@nestjs/config';
import { Multer } from 'multer';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class S3Service {
  private s3: AWS.S3;
  private logger = new Logger(S3Service.name);

  constructor(private readonly configService: ConfigService) {
    this.s3 = new AWS.S3({
      accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID'),
      secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY'),
      region: this.configService.get('AWS_REGION'),
    });
  }

  async uploadFile(file: Multer.File): Promise<AWS.S3.ManagedUpload.SendData> {
    this.logger.log('Uploading file to S3...');
    const { originalname, buffer, mimetype } = file;

    const uploadResult = await this.s3
      .upload({
        Bucket: process.env.CONVERTO_PIC_BUCKET_NAME,
        Key: originalname,
        Body: buffer,
        ContentType: mimetype,
      })
      .promise();

    this.logger.log('File uploaded successfully!');

    return uploadResult;
  }

  async uploadTextFile(
    filePath: string,
  ): Promise<AWS.S3.ManagedUpload.SendData> {
    this.logger.log('Uploading Textfile to S3...');
    const fileStream = fs.createReadStream(filePath);
    const fileName = path.basename(filePath);

    const params: AWS.S3.PutObjectRequest = {
      Bucket: process.env.CONVERTO_TRAIN_BUCKET_NAME,
      Key: fileName,
      Body: fileStream,
      ContentType: 'text/plain',
    };

    this.logger.log('TextFile uploaded successfully!');

    return this.s3.upload(params).promise();
  }

  async downloadTextFile(filePath: string) {
    this.logger.log('Downloading Textfile from S3...');
    try {
      const parts = filePath.split('/');
      const fileName = parts.pop();
      const params = {
        Bucket: process.env.CONVERTO_TRAIN_BUCKET_NAME,
        Key: fileName,
      };
      const data = await this.s3.getObject(params).promise();
      fs.writeFileSync(filePath, data.Body.toString('utf-8'));
      this.logger.log('TextFile downloaded successfully!');
    } catch (error) {
      this.logger.log('TextFile downloaded failed!');
      console.log(error);
    }
  }

  async deleteFile(filePath: string) {
    this.logger.log('Deleting file from S3...');
    try {
      const parts = filePath.split('/');
      const fileName = parts.pop();
      const params = {
        Bucket: process.env.CONVERTO_TRAIN_BUCKET_NAME,
        Key: fileName,
      };
      const data = await this.s3.deleteObject(params).promise();
      this.logger.log('File deleted successfully!');
    } catch (error) {
      this.logger.log('File deleted failed!');
      console.log(error);
    }
  }

  async isFileExists(fileName: string) {
    this.logger.log('Checking file exists in S3...');
    const params = {
      Bucket: process.env.CONVERTO_TRAIN_BUCKET_NAME,
      Key: fileName,
    };
    const data = await this.s3.getObject(params).promise();
    if (data) {
      this.logger.log('File exists in S3!');
      return true;
    } else {
      this.logger.log('File does not exists in S3!');
      return false;
    }
  }
}
