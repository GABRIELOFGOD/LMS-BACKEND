import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { OtpDto } from './dto/otp.dto';
import { UserRole } from 'src/types/user';
import { CourseProgress } from 'src/courses/entities/courseProgress.entity';
// import { Course } from 'src/courses/entities/course.entity';
import { Certificate } from 'src/certificate/entities/certificate.entity';
import { EmailService } from 'src/email/email.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(CourseProgress)
    private readonly progressRepository: Repository<CourseProgress>,

    @InjectRepository(Certificate)
    private readonly certificateRepository: Repository<Certificate>,

    private readonly emailService: EmailService
  ) {}
  
  async registrationOTP(email: string) {
    if (!email) throw new NotFoundException('Email is required');
    const userExists = await this.userRepository.findOne({
      where: { email },
    });
    if (!userExists) throw new UnauthorizedException('User not found');
    if (userExists.isBlocked) throw new UnauthorizedException('User is blocked');
    if (userExists.isDeleted) throw new UnauthorizedException('User is deleted');

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    userExists.otp = otp;
    userExists.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await this.userRepository.save(userExists);
    await this.emailService.sendOtp(otp, email);
  }

  async verifyOTP(otpDto: OtpDto) {
    const user = await this.findByEmail(otpDto.email);
    if (!user) throw new UnauthorizedException('User not found');
    if (user.isBlocked) throw new UnauthorizedException('User is blocked');
    if (user.isDeleted) throw new UnauthorizedException('User is deleted');
    if (user.isVerified) throw new UnauthorizedException('User is already verified');
    if (user.otp !== otpDto.otp) throw new UnauthorizedException('Invalid OTP');

    const currentTime = new Date();
    if (user.otpExpires < currentTime) {
      throw new UnauthorizedException('OTP expired');
    }
    user.isVerified = true;
    user.otp = null;
    user.otpExpires = null;
    await this.userRepository.save(user);
    return { message: 'User verified successfully', success: true };

  }
  
  async create(createUserDto: CreateUserDto) {
    try {
      const userExists = await this.userRepository.findOne({
        where: { email: createUserDto.email },
      });
      if (userExists) throw new NotFoundException('User already exists');

      const newUser = this.userRepository.create(createUserDto);
      const savedUser = await this.userRepository.save(newUser);
      await this.registrationOTP(savedUser.email);
      const {
        password,
        isBlocked,
        isVerified,
        isDeleted,
        updatedAt,
        otp,
        otpExpires,
        ...userWithoutPassword
      } = savedUser;
      return {
        message: "Users created successfully, an otp has been sent to your email",
        success: true,
        data: userWithoutPassword
      };
    } catch (error) {
      throw error;
    }
  }

  async getProfile(id: string) {
    return await this.userRepository.findOne({
      where: { id },
      select: ["fname", "lname", "email", "role", "address", "bio", "id", "createdAt", "updatedAt", "address", "isVerified", "phone"]
    });
  }

  async getOtherInfo(id: string) {
    try {
      let contents: {
        progress: CourseProgress[];
        certificates: Certificate[];
      } = {
        progress: [],
        certificates: []
      };
      const progress = await this.progressRepository.find({
        where: { user: { id } },
        relations: ['course', 'user'],
      });
      if (progress){
        contents = {...contents, progress}
      }

      const certificates = await this.certificateRepository.find({
        where: { user: { id } },
        relations: ['course', 'user'],
      });
      if (certificates) {
        contents.certificates = certificates;
      }

      return contents;

    } catch (error) {
      throw error;
    }
  }

  async findAll() {
    return await this.userRepository.find({
      select: [
        "id",
        "fname",
        "lname",
        "email",
        "role",
        "address",
        "bio",
        "createdAt",
        "updatedAt"
      ]
    });
  }

  async findOne(id: string) {
    try {
      const user = await this.userRepository.findOne({
        where: { id }
      });

      if (!user) throw new NotFoundException("User not found");
      return user;
    } catch (error) {
      throw error;
    }
  }

  async findByEmail(email: string) {
    try {
      const userExists = await this.userRepository.findOne({
        where: { email },
      });
      return userExists;
    } catch (error) {
      throw error;
    }
  }

  update(id: string, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  async updateRole(id: string, role: UserRole) {
    const user = await this.findOne(id);
    user.role = role;

    await this.userRepository.save(user);
    return {
      message: "Users role updated successfully!"
    }
  }

  async remove(id: string) {
    const user = await this.userRepository.findOne({
      where: { id },
      select: ['id'], // Only select the ID to avoid loading relations
    });

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    await this.userRepository.delete(id);

    return {
      message: `User with id ${id} removed successfully`,
      success: true,
    };
  }

}
