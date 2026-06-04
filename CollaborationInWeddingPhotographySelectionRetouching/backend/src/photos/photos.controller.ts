import { Controller, Get, Post, Delete, Param, UseGuards, Request, Body, Query, Res, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { PhotosService } from './photos.service';
import { Photo, PhotoRating } from './photo.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/roles.guard';
import { UserRole } from '../users/user.entity';

@Controller('photos')
@UseGuards(JwtAuthGuard)
export class PhotosController {
  constructor(private readonly photosService: PhotosService) {}

  @Get('order/:orderId')
  async findByOrderId(@Param('orderId') orderId: string, @Request() req): Promise<Photo[]> {
    return this.photosService.findByOrderId(+orderId, req.user.id, req.user.role);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req): Promise<Photo> {
    return this.photosService.findById(+id, req.user.id, req.user.role);
  }

  @Get(':id/:type')
  async getPhoto(
    @Param('id') id: string,
    @Param('type') type: string,
    @Query('ts') ts: string,
    @Query('exp') exp: string,
    @Query('sig') sig: string,
    @Res() res: Response,
    @Request() req,
  ) {
    const isValid = this.photosService.verifySignedUrl(+id, type, +ts, +exp, sig);
    if (!isValid) {
      return res.status(403).send('Invalid or expired URL');
    }

    const result = await this.photosService.getPhotoFile(+id, type, req.user.id, req.user.role);
    res.setHeader('Content-Type', result.contentType);
    res.setHeader('Content-Disposition', `inline; filename="${result.fileName}"`);
    res.setHeader('Cache-Control', 'private, max-age=3600');
    res.send(result.buffer);
  }

  @Post('upload/:orderId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.RETOUCHER)
  @UseInterceptors(FilesInterceptor('photos', 100, {
    limits: { fileSize: 20 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      const allowedTypes = /jpeg|jpg|png|gif/;
      const extname = allowedTypes.test(file.originalname.toLowerCase());
      const mimetype = allowedTypes.test(file.mimetype);
      if (extname && mimetype) {
        return cb(null, true);
      }
      cb(new Error('只允许上传图片文件'), false);
    },
  }))
  async uploadPhotos(
    @Param('orderId') orderId: string,
    @UploadedFiles() files: Express.Multer.File[],
    @Request() req,
  ): Promise<Photo[]> {
    return this.photosService.uploadPhotos(+orderId, files, req.user.id, req.user.role);
  }

  @Post(':id/select')
  async updateSelection(
    @Param('id') id: string,
    @Body('isSelected') isSelected: boolean,
    @Request() req,
  ): Promise<Photo> {
    return this.photosService.updateSelection(+id, isSelected, req.user.id, req.user.role);
  }

  @Post(':id/rating')
  async updateRating(
    @Param('id') id: string,
    @Body('rating') rating: PhotoRating,
    @Request() req,
  ): Promise<Photo> {
    return this.photosService.updateRating(+id, rating, req.user.id, req.user.role);
  }

  @Post('batch/select')
  async batchUpdateSelection(
    @Body('photoIds') photoIds: number[],
    @Body('isSelected') isSelected: boolean,
    @Request() req,
  ): Promise<void> {
    return this.photosService.batchUpdateSelection(photoIds, isSelected, req.user.id, req.user.role);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async remove(@Param('id') id: string, @Request() req): Promise<void> {
    return this.photosService.remove(+id, req.user.id, req.user.role);
  }
}
