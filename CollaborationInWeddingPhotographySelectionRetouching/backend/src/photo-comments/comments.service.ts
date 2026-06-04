import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PhotoComment } from './comment.entity';
import { PhotosService } from '../photos/photos.service';
import { UserRole } from '../users/user.entity';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(PhotoComment)
    private commentsRepository: Repository<PhotoComment>,
    private photosService: PhotosService,
  ) {}

  async findByPhotoId(photoId: number, userId: number, userRole: UserRole): Promise<PhotoComment[]> {
    await this.photosService.findById(photoId, userId, userRole);
    return this.commentsRepository.find({
      where: { photoId },
      order: { createdAt: 'DESC' },
      relations: ['user'],
      select: {
        user: {
          id: true,
          username: true,
          fullName: true,
          role: true,
        },
      },
    });
  }

  async findById(id: number, userId: number, userRole: UserRole): Promise<PhotoComment> {
    const comment = await this.commentsRepository.findOne({
      where: { id },
      relations: ['user'],
      select: {
        user: {
          id: true,
          username: true,
          fullName: true,
          role: true,
        },
      },
    });
    if (!comment) {
      throw new NotFoundException('评论不存在');
    }
    await this.photosService.findById(comment.photoId, userId, userRole);
    return comment;
  }

  async create(photoId: number, content: string, userId: number, userRole: UserRole): Promise<PhotoComment> {
    await this.photosService.findById(photoId, userId, userRole);
    
    const comment = this.commentsRepository.create({
      photoId,
      userId,
      content,
    });
    
    const savedComment = await this.commentsRepository.save(comment);
    return this.findById(savedComment.id, userId, userRole);
  }

  async update(id: number, content: string, userId: number, userRole: UserRole): Promise<PhotoComment> {
    const comment = await this.findById(id, userId, userRole);
    
    if (comment.userId !== userId && userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('无权修改此评论');
    }
    
    await this.commentsRepository.update(id, { content });
    return this.findById(id, userId, userRole);
  }

  async remove(id: number, userId: number, userRole: UserRole): Promise<void> {
    const comment = await this.findById(id, userId, userRole);
    
    if (comment.userId !== userId && userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('无权删除此评论');
    }
    
    const result = await this.commentsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('评论不存在');
    }
  }
}
