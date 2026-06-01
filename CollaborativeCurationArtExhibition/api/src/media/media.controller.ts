import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  Query,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { MediaService } from './media.service';
import { CreateMediaItemDto } from './dto/create-media-item.dto';
import { UpdateMediaItemDto } from './dto/update-media-item.dto';

@Controller('media')
export class MediaController {
  constructor(private mediaService: MediaService) {}

  @Get()
  findAll(@Query('exhibitionId') exhibitionId?: number) {
    if (exhibitionId) {
      return this.mediaService.findByExhibition(exhibitionId);
    }
    return this.mediaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.mediaService.findOne(id);
  }

  @Get(':id/versions')
  getVersions(@Param('id', ParseIntPipe) id: number) {
    return this.mediaService.getVersions(id);
  }

  @Post()
  create(@Body() createMediaItemDto: CreateMediaItemDto) {
    return this.mediaService.create(createMediaItemDto);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMediaItemDto: UpdateMediaItemDto,
  ) {
    return this.mediaService.update(id, updateMediaItemDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.mediaService.remove(id);
  }

  @Post(':id/versions')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/media',
        filename: (_req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, uniqueSuffix + extname(file.originalname));
        },
      }),
    }),
  )
  addVersion(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
    @Body('uploadedBy') uploadedBy?: string,
  ) {
    return this.mediaService.addVersion(id, file, uploadedBy);
  }
}
