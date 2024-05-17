import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Post, Query, Req, UnauthorizedException, UploadedFile, UploadedFiles, UseGuards, UseInterceptors, UsePipes } from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from 'src/auth/roles.decorator';
import { ALLOWED_EXTENSIONS, SYSTEM_CONST } from 'src/common/constants/system.constants';
import { Multer } from 'multer';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ZautoRequest } from 'src/common/models/request.model';
import { FileManagerService } from './file-manager.service';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { DeleteFilesDto } from './dto/delete-files.dto';


@ApiTags('File Manager')
@Controller('api/file-manager')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard) 
@Roles(SYSTEM_CONST.ADMIN_ROLE, SYSTEM_CONST.SUPERUSER_ROLE)
export class FileManagerController {

    constructor(
        private readonly fileManagerService: FileManagerService
    ){}

    @Post()
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FilesInterceptor('files', 10, {
        storage: diskStorage({
            destination: './uploads',
            filename: (req, file, cb) => {
                const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
                const timestamp = Date.now();
                return cb(null, `${randomName}-${timestamp}${extname(file.originalname)}`);
            },
        }),
        fileFilter: (req, file, cb) => {
            const ext = extname(file.originalname).toLowerCase();
            if (ALLOWED_EXTENSIONS.includes(ext)) {
                cb(null, true);
            } else {
                cb(new HttpException(`Invalid file type. Only ${ALLOWED_EXTENSIONS.join(', ')} files are allowed.`, HttpStatus.BAD_REQUEST), false);
            }
        },
    }))
    async uploadFiles(@UploadedFiles() files: Multer.Files,@Req() req: ZautoRequest) {
        if(req.user)
        {
            const orgId = req.orgId;
            return await this.fileManagerService.uploadFiles(orgId,files);
        }
        else
        {
            throw new UnauthorizedException();
        }
    }

    @Get()
    async findAll(@Req() req: ZautoRequest,@Query() pagination: PaginationDto)
    {
        if(req.user)
        {
            const orgId = req.orgId;
            return await this.fileManagerService.getFiles(orgId,pagination);
        }
        else
        {
            throw new UnauthorizedException();
        }
    }

    @Get(':id')
    async find(@Param('id') id:string,@Req() req: ZautoRequest)
    {
        if(req.user)
        {
            return await this.fileManagerService.getFile(id);
        }
        else
        {
            throw new UnauthorizedException();
        }
    }

    @Delete(':id')
    async deleteFile(@Param('id') id:string,@Req() req: ZautoRequest)
    {
        if(req.user)
        {
            return await this.fileManagerService.deleteFile(id);
        }
        else
        {
            throw new UnauthorizedException();
        }
    }

    @Delete()
    async deleteFiles(@Body() deleteFilesDto:DeleteFilesDto,@Req() req: ZautoRequest)
    {
        if(req.user)
        {
            return await this.fileManagerService.deleteFiles(deleteFilesDto);
        }
        else
        {
            throw new UnauthorizedException();
        }
    }
}
