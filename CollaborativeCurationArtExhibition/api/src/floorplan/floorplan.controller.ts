import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  ParseIntPipe,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { FloorPlanService } from './floorplan.service';
import { CreateFloorPlanDto } from './dto/create-floorplan.dto';
import { UpdateFloorPlanDto } from './dto/update-floorplan.dto';

@Controller('floor-plans')
export class FloorPlanController {
  constructor(private floorPlanService: FloorPlanService) {}

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.floorPlanService.findOne(id);
  }

  @Get('exhibition/:exhibitionId')
  findByExhibition(@Param('exhibitionId', ParseIntPipe) exhibitionId: number) {
    return this.floorPlanService.findByExhibition(exhibitionId);
  }

  @Post()
  create(@Body() createFloorPlanDto: CreateFloorPlanDto) {
    return this.floorPlanService.create(createFloorPlanDto);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateFloorPlanDto: UpdateFloorPlanDto,
  ) {
    return this.floorPlanService.update(id, updateFloorPlanDto);
  }

  @Post(':id/upload-bg')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/floorplans',
        filename: (_req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, uniqueSuffix + extname(file.originalname));
        },
      }),
    }),
  )
  uploadBg(@Param('id', ParseIntPipe) id: number, @UploadedFile() file: Express.Multer.File) {
    return this.floorPlanService.updateBgImage(id, file.filename);
  }
}
