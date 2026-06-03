import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking, BookingStatus } from '../../entities/booking.entity';
import { Student } from '../../entities/student.entity';
import { Teacher } from '../../entities/teacher.entity';
import { UserCoursePackage } from '../../entities/user-course-package.entity';
import { SheetMusic } from '../../entities/sheet-music.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
    @InjectRepository(Teacher)
    private teacherRepository: Repository<Teacher>,
    @InjectRepository(UserCoursePackage)
    private coursePackageRepository: Repository<UserCoursePackage>,
    @InjectRepository(SheetMusic)
    private sheetMusicRepository: Repository<SheetMusic>,
  ) {}

  async findAll(): Promise<Booking[]> {
    return this.bookingRepository.find({
      relations: ['student', 'student.user', 'teacher', 'teacher.user', 'coursePackage', 'sheetMusic'],
      order: { scheduledStart: 'DESC' },
    });
  }

  async findByStudent(studentId: number): Promise<Booking[]> {
    return this.bookingRepository.find({
      where: { student: { id: studentId } },
      relations: ['student', 'student.user', 'teacher', 'teacher.user', 'coursePackage', 'sheetMusic'],
      order: { scheduledStart: 'DESC' },
    });
  }

  async findByTeacher(teacherId: number): Promise<Booking[]> {
    return this.bookingRepository.find({
      where: { teacher: { id: teacherId } },
      relations: ['student', 'student.user', 'teacher', 'teacher.user', 'coursePackage', 'sheetMusic'],
      order: { scheduledStart: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({
      where: { id },
      relations: ['student', 'student.user', 'teacher', 'teacher.user', 'coursePackage', 'sheetMusic'],
    });
    if (!booking) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }
    return booking;
  }

  async create(createBookingDto: CreateBookingDto): Promise<Booking> {
    const student = await this.studentRepository.findOne({ where: { id: createBookingDto.studentId } });
    if (!student) {
      throw new NotFoundException(`Student with ID ${createBookingDto.studentId} not found`);
    }

    const teacher = await this.teacherRepository.findOne({ where: { id: createBookingDto.teacherId } });
    if (!teacher) {
      throw new NotFoundException(`Teacher with ID ${createBookingDto.teacherId} not found`);
    }

    const coursePackage = await this.coursePackageRepository.findOne({
      where: { id: createBookingDto.userCoursePackageId },
    });
    if (!coursePackage) {
      throw new NotFoundException(`UserCoursePackage with ID ${createBookingDto.userCoursePackageId} not found`);
    }

    let sheetMusic = null;
    if (createBookingDto.sheetMusicId) {
      sheetMusic = await this.sheetMusicRepository.findOne({
        where: { id: createBookingDto.sheetMusicId },
      });
      if (!sheetMusic) {
        throw new NotFoundException(`SheetMusic with ID ${createBookingDto.sheetMusicId} not found`);
      }
    }

    const booking = this.bookingRepository.create({
      scheduledStart: new Date(createBookingDto.scheduledStart),
      scheduledEnd: new Date(createBookingDto.scheduledEnd),
      notes: createBookingDto.notes,
      status: createBookingDto.status || BookingStatus.PENDING,
      student,
      teacher,
      coursePackage,
      sheetMusic,
    });

    return this.bookingRepository.save(booking);
  }

  async update(id: number, updateBookingDto: UpdateBookingDto): Promise<Booking> {
    const booking = await this.findOne(id);
    if (updateBookingDto.scheduledStart) {
      booking.scheduledStart = new Date(updateBookingDto.scheduledStart);
    }
    if (updateBookingDto.scheduledEnd) {
      booking.scheduledEnd = new Date(updateBookingDto.scheduledEnd);
    }
    if (updateBookingDto.cancelledAt) {
      booking.cancelledAt = new Date(updateBookingDto.cancelledAt);
    }
    if (updateBookingDto.sheetMusicId) {
      const sheetMusic = await this.sheetMusicRepository.findOne({
        where: { id: updateBookingDto.sheetMusicId },
      });
      if (!sheetMusic) {
        throw new NotFoundException(`SheetMusic with ID ${updateBookingDto.sheetMusicId} not found`);
      }
      booking.sheetMusic = sheetMusic;
    }
    Object.assign(booking, {
      notes: updateBookingDto.notes,
      status: updateBookingDto.status,
      cancellationReason: updateBookingDto.cancellationReason,
      cancelledBy: updateBookingDto.cancelledBy,
    });
    return this.bookingRepository.save(booking);
  }

  async remove(id: number): Promise<void> {
    const result = await this.bookingRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }
  }
}
