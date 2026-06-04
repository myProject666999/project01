import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import * as Jimp from 'jimp';
import { RetouchTask, RetouchTaskStatus } from './retouch-task.entity';
import { RetouchVersion, RetouchVersionStatus } from './retouch-version.entity';
import { PhotosService } from '../photos/photos.service';
import { UserRole } from '../users/user.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RetouchService {
  private uploadDir: string;

  constructor(
    @InjectRepository(RetouchTask)
    private tasksRepository: Repository<RetouchTask>,
    @InjectRepository(RetouchVersion)
    private versionsRepository: Repository<RetouchVersion>,
    private photosService: PhotosService,
    private configService: ConfigService,
  ) {
    this.uploadDir = this.configService.get('UPLOAD_DIR') || path.join(process.cwd(), 'uploads');
    this.ensureRetouchDirs();
  }

  private ensureRetouchDirs() {
    const retouchDir = path.join(this.uploadDir, 'retouch');
    if (!fs.existsSync(retouchDir)) {
      fs.mkdirSync(retouchDir, { recursive: true });
    }
  }

  generateSignedUrl(versionId: number): string {
    const timestamp = Date.now();
    const expiresIn = 3600;
    const secretKey = this.configService.get('JWT_SECRET') || 'default-secret-key';
    const data = `retouch:${versionId}:${timestamp}:${expiresIn}`;
    const signature = crypto
      .createHmac('sha256', secretKey)
      .update(data)
      .digest('hex');
    return `/retouch/versions/${versionId}/image?ts=${timestamp}&exp=${expiresIn}&sig=${signature}`;
  }

  verifySignedUrl(versionId: number, ts: number, exp: number, sig: string): boolean {
    const secretKey = this.configService.get('JWT_SECRET') || 'default-secret-key';
    const data = `retouch:${versionId}:${ts}:${exp}`;
    const expectedSignature = crypto
      .createHmac('sha256', secretKey)
      .update(data)
      .digest('hex');
    
    const isSignatureValid = crypto.timingSafeEqual(
      Buffer.from(sig),
      Buffer.from(expectedSignature),
    );
    const isExpired = Date.now() > ts + exp * 1000;
    
    return isSignatureValid && !isExpired;
  }

  async findAll(userId: number, userRole: UserRole): Promise<RetouchTask[]> {
    const where: any = {};
    if (userRole === UserRole.RETOUCHER) {
      where.retoucherId = userId;
    }
    
    return this.tasksRepository.find({
      where,
      order: { createdAt: 'DESC' },
      relations: ['photo', 'retoucher', 'versions'],
      select: {
        retoucher: {
          id: true,
          username: true,
          fullName: true,
        },
      },
    });
  }

  async findByPhotoId(photoId: number, userId: number, userRole: UserRole): Promise<RetouchTask[]> {
    await this.photosService.findById(photoId, userId, userRole);
    
    return this.tasksRepository.find({
      where: { photoId },
      order: { createdAt: 'DESC' },
      relations: ['retoucher', 'versions'],
      select: {
        retoucher: {
          id: true,
          username: true,
          fullName: true,
        },
      },
    });
  }

  async findById(id: number, userId: number, userRole: UserRole): Promise<RetouchTask> {
    const task = await this.tasksRepository.findOne({
      where: { id },
      relations: ['photo', 'retoucher', 'versions'],
      select: {
        retoucher: {
          id: true,
          username: true,
          fullName: true,
        },
      },
    });
    
    if (!task) {
      throw new NotFoundException('修图任务不存在');
    }
    
    await this.photosService.findById(task.photoId, userId, userRole);
    
    if (userRole === UserRole.RETOUCHER && task.retoucherId && task.retoucherId !== userId) {
      throw new ForbiddenException('无权访问此任务');
    }
    
    return {
      ...task,
      versions: task.versions.map(v => ({
        ...v,
        signedUrl: this.generateSignedUrl(v.id),
      })) as any,
    };
  }

  async create(photoId: number, requirements: string, userId: number, userRole: UserRole): Promise<RetouchTask> {
    if (userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('只有管理员可以创建修图任务');
    }
    
    await this.photosService.findById(photoId, userId, userRole);
    
    const existingTask = await this.tasksRepository.findOne({
      where: { photoId, status: RetouchTaskStatus.COMPLETED },
    });
    
    if (existingTask) {
      throw new BadRequestException('该照片已有完成的修图任务');
    }
    
    const task = this.tasksRepository.create({
      photoId,
      requirements,
    });
    
    return this.tasksRepository.save(task);
  }

  async assign(taskId: number, retoucherId: number, userId: number, userRole: UserRole): Promise<RetouchTask> {
    if (userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('只有管理员可以分配任务');
    }
    
    const task = await this.findById(taskId, userId, userRole);
    
    if (task.status !== RetouchTaskStatus.PENDING && task.status !== RetouchTaskStatus.REJECTED) {
      throw new BadRequestException('此任务状态不允许分配');
    }
    
    await this.tasksRepository.update(taskId, {
      retoucherId,
      status: RetouchTaskStatus.ASSIGNED,
      assignedAt: new Date(),
    });
    
    return this.findById(taskId, userId, userRole);
  }

  async startProgress(taskId: number, userId: number, userRole: UserRole): Promise<RetouchTask> {
    if (userRole !== UserRole.RETOUCHER) {
      throw new ForbiddenException('只有修图师可以开始任务');
    }
    
    const task = await this.findById(taskId, userId, userRole);
    
    if (task.retoucherId !== userId) {
      throw new ForbiddenException('您不是此任务的修图师');
    }
    
    if (task.status !== RetouchTaskStatus.ASSIGNED) {
      throw new BadRequestException('此任务状态不允许开始');
    }
    
    await this.tasksRepository.update(taskId, {
      status: RetouchTaskStatus.IN_PROGRESS,
    });
    
    return this.findById(taskId, userId, userRole);
  }

  async submitVersion(
    taskId: number,
    file: Express.Multer.File,
    retoucherNote: string,
    userId: number,
    userRole: UserRole,
  ): Promise<RetouchTask> {
    if (userRole !== UserRole.RETOUCHER) {
      throw new ForbiddenException('只有修图师可以提交版本');
    }
    
    const task = await this.findById(taskId, userId, userRole);
    
    if (task.retoucherId !== userId) {
      throw new ForbiddenException('您不是此任务的修图师');
    }
    
    if (task.status !== RetouchTaskStatus.IN_PROGRESS) {
      throw new BadRequestException('此任务状态不允许提交版本');
    }
    
    const newVersion = task.currentVersion + 1;
    
    if (newVersion > 1 && newVersion > task.maxFreeRevisions + task.paidRevisions + 1) {
      throw new BadRequestException('超出免费修订次数，需要支付额外费用');
    }
    
    const fileExt = path.extname(file.originalname).toLowerCase();
    const uniqueName = `${Date.now()}_v${newVersion}_${crypto.randomBytes(6).toString('hex')}${fileExt}`;
    const filePath = path.join('retouch', uniqueName);
    const fullFilePath = path.join(this.uploadDir, filePath);
    
    fs.writeFileSync(fullFilePath, file.buffer);
    
    const version = this.versionsRepository.create({
      taskId,
      version: newVersion,
      filePath,
      fileName: file.originalname,
      retoucherNote,
    });
    
    await this.versionsRepository.save(version);
    
    await this.tasksRepository.update(taskId, {
      currentVersion: newVersion,
      status: RetouchTaskStatus.SUBMITTED,
      submittedAt: new Date(),
    });
    
    return this.findById(taskId, userId, userRole);
  }

  async reviewVersion(
    taskId: number,
    versionId: number,
    approved: boolean,
    feedback: string,
    userId: number,
    userRole: UserRole,
  ): Promise<RetouchTask> {
    if (userRole !== UserRole.CLIENT && userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('只有客户或管理员可以审核版本');
    }
    
    const task = await this.findById(taskId, userId, userRole);
    
    if (task.status !== RetouchTaskStatus.SUBMITTED) {
      throw new BadRequestException('此任务状态不允许审核');
    }
    
    const version = await this.versionsRepository.findOne({
      where: { id: versionId, taskId },
    });
    
    if (!version) {
      throw new NotFoundException('版本不存在');
    }
    
    if (version.version !== task.currentVersion) {
      throw new BadRequestException('只能审核最新版本');
    }
    
    await this.versionsRepository.update(versionId, {
      status: approved ? RetouchVersionStatus.APPROVED : RetouchVersionStatus.REJECTED,
      clientFeedback: feedback,
    });
    
    if (approved) {
      await this.tasksRepository.update(taskId, {
        status: RetouchTaskStatus.APPROVED,
      });
    } else {
      await this.tasksRepository.update(taskId, {
        status: RetouchTaskStatus.REJECTED,
      });
    }
    
    return this.findById(taskId, userId, userRole);
  }

  async completeTask(taskId: number, userId: number, userRole: UserRole): Promise<RetouchTask> {
    if (userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('只有管理员可以完成任务');
    }
    
    const task = await this.findById(taskId, userId, userRole);
    
    if (task.status !== RetouchTaskStatus.APPROVED) {
      throw new BadRequestException('此任务状态不允许完成');
    }
    
    await this.tasksRepository.update(taskId, {
      status: RetouchTaskStatus.COMPLETED,
      completedAt: new Date(),
    });
    
    return this.findById(taskId, userId, userRole);
  }

  async getVersionImage(versionId: number, userId: number, userRole: UserRole): Promise<{ buffer: Buffer; contentType: string; fileName: string }> {
    const version = await this.versionsRepository.findOne({
      where: { id: versionId },
      relations: ['task'],
    });
    
    if (!version) {
      throw new NotFoundException('版本不存在');
    }
    
    await this.photosService.findById(version.task.photoId, userId, userRole);
    
    const filePath = path.join(this.uploadDir, version.filePath);
    
    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('图片文件不存在');
    }
    
    const image = await Jimp.read(filePath);
    const width = image.getWidth();
    const height = image.getHeight();
    
    const watermarkText = 'RETOUCH PREVIEW';
    const font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);
    
    const textWidth = Jimp.measureText(font, watermarkText);
    const x = (width - textWidth) / 2;
    const y = height - 60;
    
    image.print(font, x, y, {
      text: watermarkText,
      alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
    });
    
    image.opacity(0.4);
    
    const buffer = await image.getBufferAsync(Jimp.MIME_JPEG);
    
    return {
      buffer,
      contentType: 'image/jpeg',
      fileName: `v${version.version}_${version.fileName}`,
    };
  }

  async getRevisionInfo(taskId: number, userId: number, userRole: UserRole) {
    const task = await this.findById(taskId, userId, userRole);
    
    const usedRevisions = Math.max(0, task.currentVersion - 1);
    const freeRemaining = Math.max(0, task.maxFreeRevisions - usedRevisions);
    const needsPayment = freeRemaining === 0 && task.currentVersion > 0;
    
    return {
      currentVersion: task.currentVersion,
      maxFreeRevisions: task.maxFreeRevisions,
      usedRevisions,
      freeRemaining,
      paidRevisions: task.paidRevisions,
      needsPayment,
      revisionFee: task.revisionFee,
    };
  }

  async requestPaidRevision(taskId: number, userId: number, userRole: UserRole): Promise<RetouchTask> {
    if (userRole !== UserRole.ADMIN && userRole !== UserRole.CLIENT) {
      throw new ForbiddenException('无权请求付费修订');
    }
    
    const task = await this.findById(taskId, userId, userRole);
    
    await this.tasksRepository.update(taskId, {
      paidRevisions: task.paidRevisions + 1,
    });
    
    return this.findById(taskId, userId, userRole);
  }

  async remove(taskId: number, userId: number, userRole: UserRole): Promise<void> {
    if (userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('只有管理员可以删除任务');
    }
    
    const task = await this.findById(taskId, userId, userRole);
    
    for (const version of task.versions) {
      const filePath = path.join(this.uploadDir, version.filePath);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    
    await this.versionsRepository.delete({ taskId });
    await this.tasksRepository.delete(taskId);
  }
}
