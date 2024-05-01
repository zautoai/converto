import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors, UploadedFile, Req, HttpException, HttpStatus, Query, NotAcceptableException } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { SYSTEM_CONST } from 'src/common/constants/system.constants';
import { FileInterceptor } from '@nestjs/platform-express';
import { Multer } from 'multer';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ZautoRequest } from 'src/common/models/request.model';
import * as sharp from 'sharp';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { SelfGuard } from 'src/auth/self.guard';
import { StaticFileService } from 'src/common/services/static.service';
import { UsageService } from 'src/account/usage.service';

@Controller('api/organization/users')
@ApiTags('Users')
export class OrgUsersController {
  constructor(private readonly usersService: UsersService,
    private readonly staticFileService: StaticFileService,
    private readonly usageService: UsageService) {}

  @Post()
  @Roles(SYSTEM_CONST.ADMIN_ROLE)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  async create(@Body() createUserDto: CreateUserDto, @Req() request: ZautoRequest) {
    const orgId = request.user.org.id;
    const userUsage = await this.usageService.getUserCount(orgId);
    const remainingUser = userUsage.maxCount - userUsage.count;
    if(remainingUser > 0)
    {
      return await this.usersService.create({...createUserDto, orgId }, true);
    }
    else
    {
      throw new NotAcceptableException(`Remaining user ${remainingUser}`);
    }
  }

  @Get()
  @Roles(SYSTEM_CONST.ADMIN_ROLE,SYSTEM_CONST.SUPERUSER_ROLE)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiQuery({ name: 'page', description: 'Page number.', required: false })
  @ApiQuery({ name: 'limit', description: 'Number of records in a page.', required: false })
  @UseGuards(JwtAuthGuard, RolesGuard)
  async findAllByOrg(@Query() paginationDto: PaginationDto, @Req() request: ZautoRequest) {
    const organizationId = request.user.org.id;
    return await this.usersService.findAllByOrg(paginationDto, organizationId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, SelfGuard)
  @ApiBearerAuth()
  async findOne(@Param('id') id: string) {
    return await this.usersService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, SelfGuard)
  @ApiBearerAuth()
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return await this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @Roles(SYSTEM_CONST.ADMIN_ROLE)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  async remove(@Param('id') id: string) {
    return await this.usersService.remove(id);
  }

  @Post('profilePic')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, SelfGuard)
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './public/images',
      filename: (req, file, callback) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = extname(file.originalname.toLowerCase());
        callback(null, `${file.fieldname}-${uniqueSuffix}${extension}`);
      },
    }),
    fileFilter: (req, file, callback) => {
      // Filtering the file to be an image
      if (!file.originalname.match(/\.(jpg|jpeg|png|gif|PNG)$/)) {
        return callback(new HttpException('Only image files are allowed!', HttpStatus.BAD_REQUEST), false);
      }
      callback(null, true);
    },
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB
    },
  }))
  async uploadProfilePic(@UploadedFile() file: Multer.File, @Req() request: ZautoRequest) { 
    try {
      // Use sharp to compress and optionally resize the image
      const outputPath = `./public/images/compressed-${file.filename}`;
      await sharp(file.path)
        .resize(800) // Resize to width of 800 pixels, maintaining aspect ratio
        .toFormat('jpeg') // Convert to JPEG for compression
        .jpeg({ quality: 50 }) // Set the quality of the image
        .toFile(outputPath);

      await this.staticFileService.deleteExistingFile(file.path);

      const userId = request.user.id;
      const imgUrl = `${process.env.HOST_URL}/images/compressed-${file.filename}`
      this.usersService.updateProfilePicUrl(userId, {
        imgUrl: imgUrl,
      });

      return {
        message: 'File uploaded and compressed successfully.',
        file: {
          originalName: file.originalname,
          filename: file.filename,
          size: file.size,
          mimeType: file.mimetype,
          path: imgUrl,
        },
      };
    } catch (error) {
      throw new HttpException('Error processing image', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

}
