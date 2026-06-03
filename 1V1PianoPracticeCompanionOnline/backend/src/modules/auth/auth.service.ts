import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../../entities/user.entity';
import { Student } from '../../entities/student.entity';
import { Teacher } from '../../entities/teacher.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
    @InjectRepository(Teacher)
    private teacherRepository: Repository<Teacher>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { username, email, password, role } = registerDto;

    const existingUser = await this.userRepository.findOne({ where: [{ username }, { email }] });
    if (existingUser) {
      throw new UnauthorizedException('Username or email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = this.userRepository.create({
      username,
      email,
      password: hashedPassword,
      role,
      name: registerDto.name || username,
    });

    const savedUser = await this.userRepository.save(user);

    if (role === 'student') {
      const student = this.studentRepository.create({ userId: savedUser.id });
      await this.studentRepository.save(student);
    } else if (role === 'teacher') {
      const teacher = this.teacherRepository.create({ userId: savedUser.id });
      await this.teacherRepository.save(teacher);
    }

    return this.generateToken(savedUser);
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    console.log('Login attempt:', { email, passwordLength: password?.length });
    const user = await this.userRepository.findOne({ where: { email } });
    console.log('User found:', user ? { id: user.id, email: user.email, hasPassword: !!user.password, passwordPrefix: user.password?.substring(0, 10) } : null);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials - user not found');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('Password valid:', isPasswordValid);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials - wrong password');
    }

    return this.generateToken(user);
  }

  private generateToken(user: User) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        name: user.name,
        avatarUrl: user.avatarUrl,
      },
    };
  }
}
