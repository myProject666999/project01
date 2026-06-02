import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking, BookingStatus } from '../../entities/booking.entity';
import { Student } from '../../entities/student.entity';
import { Teacher } from '../../entities/teacher.entity';
import { UserCoursePackage } from '../../entities/user-course-package.entity';
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
  ) {}

  async findAll(): Promise<Booking[]> {
    return this.bookingRepository.find({
      relations: ['student', 'student.user', 'teacher', 'teacher.user', 'coursePackage'],
      order: { startTime: 'DESC' },
    });
  }

  async findByStudent(studentId: number): Promise<Booking[]> {
    return this.bookingRepository.find({
      where: { student: { id: studentId } },
      relations: ['student', 'student.user', 'teacher', 'teacher.user', 'coursePackage'],
      order: { startTime: 'DESC' },
    });
  }

  async findByTeacher(teacherId: number): Promise<Booking[]> {
    return this.bookingRepository.find({
      where: { teacher: { id: teacherId } },
      relations: ['student', 'student.user', 'teacher', 'teacher.user', 'coursePackage'],
      order: { startTime: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({
      where: { id },
      relations: ['student', 'student.user', 'teacher', 'teacher.user', 'coursePackage'],
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

    let coursePackage = null;
    if (createBookingDto.coursePackageId) {
      coursePackage = await this.coursePackageRepository.findOne({
        where: { id: createBookingDto.coursePackageId },
      });
      if (!coursePackage) {
        throw new NotFoundException(`CoursePackage with ID ${createBookingDto.coursePackageId} not found`);
      }
    }

    const booking = this.bookingRepository.create({
      startTime: new Date(createBookingDto.startTime),
      endTime: new Date(createBookingDto.endTime),
      notes: createBookingDto.notes,
      status: createBookingDto.status || BookingStatus.PENDING,
      student,
      teacher,
      coursePackage,
    });

    return this.bookingRepository.save(booking);
  }

  async update(id: number, updateBookingDto: UpdateBookingDto): Promise<Booking> {
    const booking = await this.findOne(id);
    if (updateBookingDto.startTime) {
      booking.startTime = new Date(updateBookingDto.startTime);
    }
    if (updateBookingDto.endTime) {
      booking.endTime = new Date(updateBookingDto.endTime);
    }
    Object.assign(booking, updateBookingDto);
    return this.bookingRepository.save(booking);
  }

  async remove(id: number): Promise<void> {
    const result = await this.bookingRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }
  }
}
