import { Controller, Get, Post, Delete, Param, UseGuards, Request, Body, Query, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { RetouchService } from './retouch.service';
import { RetouchTask } from './retouch-task.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/roles.guard';
import { UserRole } from '../users/user.entity';

@Controller('retouch')
@UseGuards(JwtAuthGuard)
export class RetouchController {
  constructor(private readonly retouchService: RetouchService) {}

  @Get()
  async findAll(@Request() req): Promise<RetouchTask[]> {
    return this.retouchService.findAll(req.user.id, req.user.role);
  }

  @Get('photo/:photoId')
  async findByPhotoId(@Param('photoId') photoId: string, @Request() req): Promise<RetouchTask[]> {
    return this.retouchService.findByPhotoId(+photoId, req.user.id, req.user.role);
  }

  @Get('tasks/:id')
  async findOne(@Param('id') id: string, @Request() req): Promise<RetouchTask> {
    return this.retouchService.findById(+id, req.user.id, req.user.role);
  }

  @Get('tasks/:id/revision-info')
  async getRevisionInfo(@Param('id') id: string, @Request() req) {
    return this.retouchService.getRevisionInfo(+id, req.user.id, req.user.role);
  }

  @Post('tasks')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async create(
    @Body('photoId') photoId: number,
    @Body('requirements') requirements: string,
    @Request() req,
  ): Promise<RetouchTask> {
    return this.retouchService.create(photoId, requirements, req.user.id, req.user.role);
  }

  @Post('tasks/:id/assign')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async assign(
    @Param('id') id: string,
    @Body('retoucherId') retoucherId: number,
    @Request() req,
  ): Promise<RetouchTask> {
    return this.retouchService.assign(+id, retoucherId, req.user.id, req.user.role);
  }

  @Post('tasks/:id/start')
  @UseGuards(RolesGuard)
  @Roles(UserRole.RETOUCHER)
  async startProgress(@Param('id') id: string, @Request() req): Promise<RetouchTask> {
    return this.retouchService.startProgress(+id, req.user.id, req.user.role);
  }

  @Post('tasks/:id/submit')
  @UseGuards(RolesGuard)
  @Roles(UserRole.RETOUCHER)
  @UseInterceptors(FileInterceptor('file', {
    limits: { fileSize: 30 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      const allowedTypes = /jpeg|jpg|png|tiff/;
      const extname = allowedTypes.test(file.originalname.toLowerCase());
      const mimetype = allowedTypes.test(file.mimetype);
      if (extname && mimetype) {
        return cb(null, true);
      }
      cb(new Error('只允许上传图片文件'), false);
    },
  }))
  async submitVersion(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('retoucherNote') retoucherNote: string,
    @Request() req,
  ): Promise<RetouchTask> {
    return this.retouchService.submitVersion(+id, file, retoucherNote, req.user.id, req.user.role);
  }

  @Post('tasks/:id/review/:versionId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.CLIENT, UserRole.ADMIN)
  async reviewVersion(
    @Param('id') id: string,
    @Param('versionId') versionId: string,
    @Body('approved') approved: boolean,
    @Body('feedback') feedback: string,
    @Request() req,
  ): Promise<RetouchTask> {
    return this.retouchService.reviewVersion(+id, +versionId, approved, feedback, req.user.id, req.user.role);
  }

  @Post('tasks/:id/complete')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async completeTask(@Param('id') id: string, @Request() req): Promise<RetouchTask> {
    return this.retouchService.completeTask(+id, req.user.id, req.user.role);
  }

  @Post('tasks/:id/paid-revision')
  async requestPaidRevision(@Param('id') id: string, @Request() req): Promise<RetouchTask> {
    return this.retouchService.requestPaidRevision(+id, req.user.id, req.user.role);
  }

  @Get('versions/:versionId/image')
  async getVersionImage(
    @Param('versionId') versionId: string,
    @Query('ts') ts: string,
    @Query('exp') exp: string,
    @Query('sig') sig: string,
    @Res() res: Response,
    @Request() req,
  ) {
    const isValid = this.retouchService.verifySignedUrl(+versionId, +ts, +exp, sig);
    if (!isValid) {
      return res.status(403).send('Invalid or expired URL');
    }

    const result = await this.retouchService.getVersionImage(+versionId, req.user.id, req.user.role);
    res.setHeader('Content-Type', result.contentType);
    res.setHeader('Content-Disposition', `inline; filename="${result.fileName}"`);
    res.setHeader('Cache-Control', 'private, max-age=3600');
    res.send(result.buffer);
  }

  @Delete('tasks/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async remove(@Param('id') id: string, @Request() req): Promise<void> {
    return this.retouchService.remove(+id, req.user.id, req.user.role);
  }
}
