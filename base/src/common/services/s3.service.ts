import { Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import { ConfigService } from '@nestjs/config';
import { Multer } from 'multer';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class S3Service {
  private s3: AWS.S3;

  constructor(private readonly configService: ConfigService) {
    this.s3 = new AWS.S3({
      accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID'),
      secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY'),
      region: this.configService.get('AWS_REGION'),
    });
  }

  async uploadFile(file: Multer.File): Promise<AWS.S3.ManagedUpload.SendData> {
    const { originalname, buffer, mimetype } = file;

    const uploadResult = await this.s3
      .upload({
        Bucket: process.env.ZAUTOPIC_BUCKET_NAME,
        Key: originalname,
        Body: buffer,
        ContentType: mimetype,
      })
      .promise();

    return uploadResult;
  }

  async uploadTextFile(filePath: string): Promise<AWS.S3.ManagedUpload.SendData> {
    const fileStream = fs.createReadStream(filePath);
    const fileName = path.basename(filePath);

    const params: AWS.S3.PutObjectRequest = {
      Bucket: process.env.ZAUTOTRAIN_BUCKET_NAME,
      Key: fileName,
      Body: fileStream,
      ContentType: 'text/plain',
    };

    return this.s3.upload(params).promise();
  }

  async downloadTextFile(filePath: string) {
    try {
      const parts = filePath.split('/');
      const fileName = parts.pop();
      const params = { Bucket: process.env.ZAUTOTRAIN_BUCKET_NAME, Key: fileName };
      const data = await this.s3.getObject(params).promise();
      fs.writeFileSync(filePath, data.Body.toString('utf-8'));
    } catch (error) {
      console.log(error);
    }
  }

  async deleteFile(filePath: string) {
    try {
      const parts = filePath.split('/');
      const fileName = parts.pop();
      const params = { Bucket: process.env.ZAUTOTRAIN_BUCKET_NAME, Key: fileName };
      const data = await this.s3.deleteObject(params).promise();
    } catch (error) {
      console.log(error);
    }
  }

  async isFileExists(fileName: string) {
    const params = { Bucket: process.env.ZAUTOTRAIN_BUCKET_NAME, Key: fileName };
    const data = await this.s3.getObject(params).promise();
    if (data) {
      return true;
    } else return false;
  }
}
