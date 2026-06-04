import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { PhotoComment } from './comment.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('photo-comments')
@UseGuards(JwtAuthGuard)
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get('photo/:photoId')
  async findByPhotoId(@Param('photoId') photoId: string, @Request() req): Promise<PhotoComment[]> {
    return this.commentsService.findByPhotoId(+photoId, req.user.id, req.user.role);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req): Promise<PhotoComment> {
    return this.commentsService.findById(+id, req.user.id, req.user.role);
  }

  @Post('photo/:photoId')
  async create(
    @Param('photoId') photoId: string,
    @Body('content') content: string,
    @Request() req,
  ): Promise<PhotoComment> {
    return this.commentsService.create(+photoId, content, req.user.id, req.user.role);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body('content') content: string,
    @Request() req,
  ): Promise<PhotoComment> {
    return this.commentsService.update(+id, content, req.user.id, req.user.role);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req): Promise<void> {
    return this.commentsService.remove(+id, req.user.id, req.user.role);
  }
}
