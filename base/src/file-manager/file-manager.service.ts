import { BadRequestException, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Multer } from 'multer';
import * as fs from 'fs';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { DeleteFilesDto } from './dto/delete-files.dto';
import * as textract from 'textract';
import * as PDFParser from 'pdf-parse';
import { S3Service } from 'src/common/services/s3.service';
import { FileUtilService } from 'src/common/services/file-utility.service';
import { ChromaDBService } from 'src/chroma/chroma-dbservice/chroma-db.service';
import { BaseService } from 'src/common/services/base.service';
import { ServiceParams } from 'src/common/models/service-param.model';

const MAX_TOTAL_FILE_SIZE = +process.env.MAX_TOTAL_FILE_SIZE * 1024 * 1024;

@Injectable()
export class FileManagerService extends BaseService {

    constructor(
        private readonly s3Service: S3Service,
        private fileService: FileUtilService,
        private chromaService: ChromaDBService,
    ) {
        super();
    }

    async getFiles(serviceParams: ServiceParams<PaginationDto>) {
        const { orgId, data: paginationDto } = serviceParams;
        const { page, limit } = paginationDto;
        const skip = (page - 1) * limit;
        const prisma = await this.getPrismaClient(orgId);
        try {
            const agent = await prisma.agent.findFirst();
            if (!agent) {
                throw new NotFoundException(`Agnet not found`);
            }
            const data = await prisma.agentFile.findMany({
                where: {
                    agentId: agent.id,
                    fileId: null
                },
                skip,
                take: limit
            });
            const total = await prisma.agentFile.count({
                where: {
                    agentId: agent.id,
                    fileId: null
                },
                skip,
                take: limit
            });
            return {
                data: data,
                page: page,
                total: total
            };
        } catch (error) {
            throw error
        } finally {
            await this.closeConnection(orgId)
        }
    }

    async getFile(orgId: string, id: string) {
        const prisma = await this.getPrismaClient(orgId);
        try {
            const existingFile = await prisma.agentFile.findUnique({
                where: {
                    id
                }
            });
            if (!existingFile) {
                throw new NotFoundException(`File not found with ${id}`);
            }
            return existingFile;
        } catch (error) {
            throw error
        } finally {
            await this.closeConnection(orgId)
        }
    }

    async uploadFiles(orgId: string, files: Multer.files) {
        const uploadedFiles = [];
        const failedFiles = [];
        const prisma = await this.getPrismaClient(orgId);
        try {
            const agent = await prisma.agent.findFirst();
            if (!agent) {
                throw new NotFoundException(`Agnet not found`);
            }

            const oldFiles = await prisma.agentFile.findMany({
                where: {
                    agentId: agent.id,
                    fileId: null,
                },
            });

            const totalUploadedFileSize = oldFiles.reduce((acc, file) => acc + file.size, 0);
            const totalFileSize = files.reduce((acc, file) => acc + file.size, 0);
            const availableSize = (MAX_TOTAL_FILE_SIZE - totalUploadedFileSize);

            if (totalFileSize > MAX_TOTAL_FILE_SIZE || availableSize < totalFileSize) {
                throw new HttpException(`Total file size exceeds the maximum allowed size`, HttpStatus.BAD_REQUEST);
            }
            for (const file of files) {
                try {
                    let filePath = `${process.env.UPLOADS_FOLDER}/${file.filename}`;
                    let textContent = "";
                    if (file.filename.includes('.pdf')) {
                        textContent = await this.pdfToText(filePath);
                    }
                    else {
                        textContent = await this.convertDocumentToText(filePath);
                    }
                    if (textContent && textContent.length > 1) {
                        textContent = textContent.replace(/\s+/g, ' ').replace(/\n/g, ' ')
                            .replace(/\t/g, ' ').replace(/\r/g, ' ');
                    }
                    textContent = textContent.trim();
                    this.fileService.deleteFile(filePath);
                    filePath = filePath.replace(/\.[^/.]+$/, ".txt");
                    this.fileService.createOrAppendFile(filePath, textContent);

                    const s3Response = await this.s3Service.uploadTextFile(filePath);
                    if (!s3Response || !s3Response.Location) throw 'File not uplaoded to s3.';
                    this.fileService.deleteFile(filePath);

                    const newFile = await prisma.agentFile.create({
                        data: {
                            agentId: agent.id,
                            path: s3Response.Location,
                            size: file.size,
                            fileName: file.originalname
                        }
                    });
                    const fileWithContent = { ...newFile, ...{ textContent: textContent } }
                    uploadedFiles.push(fileWithContent);
                }
                catch (error) {
                    failedFiles.push(file);
                    throw error;
                }
            }
            for (const file of uploadedFiles) {

                // const s3Response = await this.s3Service.uploadTextFile(file.path);
                // if (!s3Response || !s3Response.Location) throw 'File not uplaoded to s3.';
                const content = {
                    textContent: file.textContent,
                    fileId: file.id,
                    fileName: file.fileName,
                    path: file.path
                }
                const processed = await this.chromaService.addFileDataTonamesapce(agent.name, content, { id: file.id, fileName: file.fileName });
            }
            return { message: "Files uploaded successfully", statusCode: HttpStatus.OK };
        }
        catch (error) {
            for (const file of files) {
                const filePath = `${process.env.UPLOADS_FOLDER}/${file.filename}`;
                await this.unlink(filePath);
            }
            for (const file of uploadedFiles) {
                await prisma.agentFile.delete({ where: { id: file.id } });
                this.s3Service.deleteFile(file.path);
            }
            throw error;
        }
        finally {
            await this.closeConnection(orgId)
        }
    }

    async deleteFile(orgId: string, id: string): Promise<void> {
        const prisma = await this.getPrismaClient(orgId);
        try {
            const existingFile = await prisma.agentFile.findUnique({
                where: {
                    id
                },
                include: {
                    agent: true
                }
            });
            if (!existingFile) {
                throw new NotFoundException(`File not found with ${id}`);
            }
            await prisma.agentFile.delete({ where: { id } });
            await this.chromaService.removeFileDocs(existingFile.agent.name, existingFile.id);
            // await this.unlink(existingFile.path);
            this.s3Service.deleteFile(existingFile.path);
        } catch (error) {
            throw error
        } finally {
            await this.closeConnection(orgId)
        }
    }

    async deleteFiles(serviceParams: ServiceParams<DeleteFilesDto>): Promise<void> {
        const { orgId, data: deleteFilesDto } = serviceParams;
        const prisma = await this.getPrismaClient(orgId);
        try {
            for (const fileId of deleteFilesDto.fileIds) {
                const existingFile = await prisma.agentFile.findUnique({
                    where: {
                        id: fileId
                    },
                    include: {
                        agent: true
                    }
                });
                if (!existingFile) {
                    continue;
                }
                await prisma.agentFile.delete({ where: { id: fileId } });
                await this.chromaService.removeFileDocs(existingFile.agent.name, existingFile.id);
                // await this.unlink(existingFile.path);
                this.s3Service.deleteFile(existingFile.path);
            }
        } catch (error) {
            throw error
        } finally {
            await this.closeConnection(orgId)
        }
    }

    private async unlink(filePath: string) {
        try {
            await fs.promises.unlink(filePath);
        } catch (err) {
            console.error(`Error deleting file ${filePath}:`, err);
        }
    }

    async convertDocumentToText(filePath: string): Promise<string> {
        return new Promise((resolve, reject) => {
            textract.fromFileWithPath(filePath, (error: Error | null, text: string | null) => {
                if (error) {
                    reject(new BadRequestException('Error while extracting text: ' + error.message));
                } else if (text) {
                    resolve(text);
                } else {
                    reject(new BadRequestException('No text extracted.'));
                }
            });
        });
    }

    async pdfToText(filePath: string): Promise<string> {
        try {
            const pdfBuffer: Buffer = fs.readFileSync(filePath);
            const data = await PDFParser(pdfBuffer);
            const text: string = data.text;
            return text;
        }
        catch (error) {
            throw new BadRequestException('Unable to read text from pdf');
        }
    }
}
