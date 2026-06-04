import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import * as Jimp from 'jimp';
import { Photo, PhotoRating } from './photo.entity';
import { UserRole } from '../users/user.entity';
import { OrdersService } from '../orders/orders.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PhotosService {
  private uploadDir: string;
  private secretKey: string;

  constructor(
    @InjectRepository(Photo)
    private photosRepository: Repository<Photo>,
    private ordersService: OrdersService,
    private configService: ConfigService,
  ) {
    this.uploadDir = this.configService.get('UPLOAD_DIR') || path.join(process.cwd(), 'uploads');
    this.secretKey = this.configService.get('JWT_SECRET') || 'default-secret-key';
    this.ensureUploadDirs();
  }

  private ensureUploadDirs() {
    const dirs = [
      this.uploadDir,
      path.join(this.uploadDir, 'originals'),
      path.join(this.uploadDir, 'thumbnails'),
    ];
    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  generateSignedUrl(photoId: number, type: 'original' | 'thumbnail' | 'watermarked'): string {
    const timestamp = Date.now();
    const expiresIn = 3600;
    const data = `${photoId}:${type}:${timestamp}:${expiresIn}`;
    const signature = crypto
      .createHmac('sha256', this.secretKey)
      .update(data)
      .digest('hex');
    return `/photos/${photoId}/${type}?ts=${timestamp}&exp=${expiresIn}&sig=${signature}`;
  }

  verifySignedUrl(photoId: number, type: string, ts: number, exp: number, sig: string): boolean {
    const data = `${photoId}:${type}:${ts}:${exp}`;
    const expectedSignature = crypto
      .createHmac('sha256', this.secretKey)
      .update(data)
      .digest('hex');
    
    const isSignatureValid = crypto.timingSafeEqual(
      Buffer.from(sig),
      Buffer.from(expectedSignature),
    );
    const isExpired = Date.now() > ts + exp * 1000;
    
    return isSignatureValid && !isExpired;
  }

  async findByOrderId(orderId: number, userId: number, userRole: UserRole): Promise<Photo[]> {
    await this.ordersService.findById(orderId, userId, userRole);
    const photos = await this.photosRepository.find({
      where: { orderId },
      order: { createdAt: 'DESC' },
    });
    return photos.map(photo => ({
      ...photo,
      signedUrl: this.generateSignedUrl(photo.id, 'watermarked'),
      thumbnailUrl: this.generateSignedUrl(photo.id, 'thumbnail'),
    })) as any;
  }

  async findById(id: number, userId: number, userRole: UserRole): Promise<Photo> {
    const photo = await this.photosRepository.findOne({ where: { id } });
    if (!photo) {
      throw new NotFoundException('照片不存在');
    }
    await this.ordersService.findById(photo.orderId, userId, userRole);
    return {
      ...photo,
      signedUrl: this.generateSignedUrl(photo.id, 'watermarked'),
      thumbnailUrl: this.generateSignedUrl(photo.id, 'thumbnail'),
    } as any;
  }

  async getPhotoFile(id: number, type: string, userId: number, userRole: UserRole): Promise<{ buffer: Buffer; contentType: string; fileName: string }> {
    const photo = await this.photosRepository.findOne({ where: { id } });
    if (!photo) {
      throw new NotFoundException('照片不存在');
    }
    await this.ordersService.findById(photo.orderId, userId, userRole);

    let filePath: string;
    let contentType = 'image/jpeg';

    switch (type) {
      case 'original':
        if (userRole !== UserRole.ADMIN && userRole !== UserRole.RETOUCHER) {
          throw new ForbiddenException('无权下载原图');
        }
        filePath = path.join(this.uploadDir, photo.originalPath);
        break;
      case 'thumbnail':
        filePath = path.join(this.uploadDir, photo.thumbnailPath);
        break;
      case 'watermarked':
        return this.generateWatermarkedImage(photo);
      default:
        throw new BadRequestException('无效的图片类型');
    }

    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('图片文件不存在');
    }

    const buffer = fs.readFileSync(filePath);
    return {
      buffer,
      contentType,
      fileName: photo.fileName,
    };
  }

  private async generateWatermarkedImage(photo: Photo): Promise<{ buffer: Buffer; contentType: string; fileName: string }> {
    const originalPath = path.join(this.uploadDir, photo.originalPath);
    
    if (!fs.existsSync(originalPath)) {
      throw new NotFoundException('原始图片文件不存在');
    }

    const image = await Jimp.read(originalPath);
    const width = image.getWidth();
    const height = image.getHeight();

    const watermarkText = 'WEDDING PREVIEW';
    const fontSize = Math.max(24, Math.min(width, height) / 20);
    
    const font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);
    
    const textWidth = Jimp.measureText(font, watermarkText);
    const textHeight = Jimp.measureTextHeight(font, watermarkText, width);
    
    const x = (width - textWidth) / 2;
    const y = (height - textHeight) / 2;

    image.print(font, x, y, {
      text: watermarkText,
      alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
      alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE,
    });

    image.opacity(0.3);

    const buffer = await image.getBufferAsync(Jimp.MIME_JPEG);

    return {
      buffer,
      contentType: 'image/jpeg',
      fileName: `watermarked_${photo.fileName}`,
    };
  }

  async uploadPhotos(orderId: number, files: Express.Multer.File[], userId: number, userRole: UserRole): Promise<Photo[]> {
    const order = await this.ordersService.findById(orderId, userId, userRole);
    
    if (userRole === UserRole.CLIENT) {
      throw new ForbiddenException('客户无权上传照片');
    }

    const photos: Photo[] = [];

    for (const file of files) {
      const fileExt = path.extname(file.originalname).toLowerCase();
      const uniqueName = `${Date.now()}_${crypto.randomBytes(8).toString('hex')}${fileExt}`;
      
      const originalPath = path.join('originals', uniqueName);
      const fullOriginalPath = path.join(this.uploadDir, originalPath);
      
      fs.writeFileSync(fullOriginalPath, file.buffer);

      const image = await Jimp.read(file.buffer);
      const width = image.getWidth();
      const height = image.getHeight();

      const thumbnailName = `thumb_${uniqueName}`;
      const thumbnailPath = path.join('thumbnails', thumbnailName);
      const fullThumbnailPath = path.join(this.uploadDir, thumbnailPath);
      
      image.resize(400, Jimp.AUTO).write(fullThumbnailPath);

      const photo = this.photosRepository.create({
        orderId,
        fileName: file.originalname,
        originalPath,
        thumbnailPath,
        fileSize: file.size,
        width,
        height,
        uploadedBy: userId,
      });

      const savedPhoto = await this.photosRepository.save(photo);
      photos.push({
        ...savedPhoto,
        signedUrl: this.generateSignedUrl(savedPhoto.id, 'watermarked'),
        thumbnailUrl: this.generateSignedUrl(savedPhoto.id, 'thumbnail'),
      } as any);
    }

    await this.ordersService.updatePhotoCounts(orderId, userId, userRole);
    return photos;
  }

  async updateSelection(id: number, isSelected: boolean, userId: number, userRole: UserRole): Promise<Photo> {
    const photo = await this.findById(id, userId, userRole);
    await this.photosRepository.update(id, { isSelected });
    await this.ordersService.updatePhotoCounts(photo.orderId, userId, userRole);
    return this.findById(id, userId, userRole);
  }

  async updateRating(id: number, rating: PhotoRating, userId: number, userRole: UserRole): Promise<Photo> {
    const photo = await this.findById(id, userId, userRole);
    await this.photosRepository.update(id, { rating });
    return this.findById(id, userId, userRole);
  }

  async batchUpdateSelection(photoIds: number[], isSelected: boolean, userId: number, userRole: UserRole): Promise<void> {
    if (photoIds.length === 0) return;
    
    const photos = await this.photosRepository.findByIds(photoIds);
    if (photos.length === 0) return;

    const orderId = photos[0].orderId;
    await this.ordersService.findById(orderId, userId, userRole);

    await this.photosRepository.update(photoIds, { isSelected });
    await this.ordersService.updatePhotoCounts(orderId, userId, userRole);
  }

  async remove(id: number, userId: number, userRole: UserRole): Promise<void> {
    const photo = await this.photosRepository.findOne({ where: { id } });
    if (!photo) {
      throw new NotFoundException('照片不存在');
    }
    
    if (userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('只有管理员可以删除照片');
    }

    const originalPath = path.join(this.uploadDir, photo.originalPath);
    const thumbnailPath = path.join(this.uploadDir, photo.thumbnailPath);
    
    if (fs.existsSync(originalPath)) fs.unlinkSync(originalPath);
    if (fs.existsSync(thumbnailPath)) fs.unlinkSync(thumbnailPath);

    await this.photosRepository.delete(id);
    await this.ordersService.updatePhotoCounts(photo.orderId, userId, userRole);
  }
}
