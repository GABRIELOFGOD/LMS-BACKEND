import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { OtpDto } from './dto/otp.dto';
import { UserRole } from 'src/types/user';
import { CourseProgress } from 'src/courses/entities/courseProgress.entity';
// import { Course } from 'src/courses/entities/course.entity';
import { Certificate, CertificateStatus } from 'src/certificate/entities/certificate.entity';
import { EmailService } from 'src/email/email.service';
import { Course } from 'src/courses/entities/course.entity';
import { Enrollment } from 'src/courses/entities/enrollments.entity';
import { Attachment } from 'src/courses/entities/attachment.entity';
import { startOfMonth, subMonths, isAfter, isBefore } from 'date-fns';
import { ChapterProgress } from 'src/courses/entities/chapter.entity';
import { Chapters } from 'src/chapters/entities/chapter.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(CourseProgress)
    private readonly progressRepository: Repository<CourseProgress>,

    @InjectRepository(Certificate)
    private readonly certificateRepository: Repository<Certificate>,

    @InjectRepository(Enrollment)
    private readonly enrollRepository: Repository<Enrollment>,

    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,

    @InjectRepository(Attachment)
    private readonly attachmentRepository: Repository<Attachment>,

    private readonly emailService: EmailService,

    @InjectRepository(ChapterProgress)
    private chapterProgressRepo: Repository<ChapterProgress>,

    @InjectRepository(CourseProgress)
    private courseProgressRepo: Repository<CourseProgress>,

    @InjectRepository(Chapters)
    private chapterRepo: Repository<Chapters>,

    @InjectRepository(Certificate)
    private certificateRepo: Repository<Certificate>
  ) {}

  async registrationOTP(email: string) {
    if (!email) throw new NotFoundException('Email is required');
    const userExists = await this.userRepository.findOne({
      where: { email },
    });
    if (!userExists) throw new UnauthorizedException('User not found');
    if (userExists.isBlocked)
      throw new UnauthorizedException('User is blocked');
    if (userExists.isDeleted)
      throw new UnauthorizedException('User is deleted');

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
    if (user.isVerified)
      throw new UnauthorizedException('User is already verified');
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
        message:
          'Users created successfully, an otp has been sent to your email',
        success: true,
        data: userWithoutPassword,
      };
    } catch (error) {
      throw error;
    }
  }

  async getProfile(id: string) {
    const user = await this.userRepository.findOne({
      where: { id },
      select: [
        'fname',
        'lname',
        'email',
        'role',
        'address',
        'bio',
        'id',
        'createdAt',
        'updatedAt',
        'address',
        'isVerified',
        'phone',
      ],
    });

    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async getOtherInfo(id: string) {
    try {
      let contents: {
        progress: CourseProgress[];
        certificates: Certificate[];
        coursesCompleted: Course[];
        coursesEnrolled: {
          course: Course;
          comppletedChapters: ChapterProgress[];
        }[];
        currentStraek: number;
        longestStreak: number;
      } = {
        progress: [],
        certificates: [],
        coursesCompleted: [],
        coursesEnrolled: [],
        currentStraek: 6,
        longestStreak: 10,
      };
      const progress = await this.progressRepository.find({
        where: { user: { id } },
        relations: ['course', 'user'],
      });
      if (progress) {
        contents = { ...contents, progress };
      }

      const certificates = await this.certificateRepository.find({
        where: { user: { id } },
        relations: ['course', 'user'],
      });
      if (certificates) {
        contents.certificates = certificates;
      }

      const coursesEnrolledFor = await this.enrollRepository.find({
        where: { student: { id } },
        relations: ['student', 'course', "course.chapters"],
      });

      contents.coursesEnrolled = await Promise.all(
      coursesEnrolledFor.map(async (enr) => {
        const completedChapters = await this.chapterProgressRepo.find({
          where: {
            user: { id },                   // progress for this user
            course: { id: enr.course.id }, // within this course
            completed: true,               // only completed ones
          },
          relations: ['chapter'],
        });

        return {
          course: enr.course,
          comppletedChapters: completedChapters,
        };
      })
    );

      return contents;
    } catch (error) {
      throw error;
    }
  }

  async findAll() {
    return await this.userRepository.find({
      select: [
        'id',
        'fname',
        'lname',
        'email',
        'role',
        'address',
        'bio',
        'createdAt',
        'updatedAt'
      ],
    });
  }

  async findOne(id: string) {
    try {
      const user = await this.userRepository.findOne({
        where: { id },
      });

      if (!user) throw new NotFoundException('User not found');
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

  async superStats(id: string) {
    try {
      const user = await this.userRepository.findOne({ where: { id } });
      if (!user) throw new NotFoundException('User not found');

      const details = {
        name: `${user.fname} ${user.lname}`,
        bio: user.bio,
        avatar: '',
        initials: `${user.fname.slice(0, 1)}${user.lname.slice(0, 1)}`,
        joinedAt: user.createdAt,
      };

      // Fetch all
      const allUsers = await this.userRepository.find();
      const allCourses = await this.courseRepository.find();
      const allResources = await this.attachmentRepository.find({
        relations: ['course'],
      });
      const allCertificates = await this.certificateRepository.find({
        relations: ['user', 'course'],
      });

      // Date ranges
      const now = new Date();
      const startOfCurrentMonth = startOfMonth(now);
      const startOfPrevMonth = startOfMonth(subMonths(now, 1));

      // Helper to calculate trend
      const calcTrend = (arr: any[]): string => {
        const currentMonth = arr.filter((i) =>
          isAfter(i.createdAt, startOfCurrentMonth),
        ).length;

        const prevMonth = arr.filter(
          (i) =>
            isAfter(i.createdAt, startOfPrevMonth) &&
            isBefore(i.createdAt, startOfCurrentMonth),
        ).length;

        if (prevMonth === 0 && currentMonth > 0) return '↑ 100%';
        if (prevMonth === 0 && currentMonth === 0) return '0%';

        const percentage = ((currentMonth - prevMonth) / prevMonth) * 100;

        if (percentage > 0) return `↑ ${percentage.toFixed(1)}%`;
        if (percentage < 0) return `↓ ${Math.abs(percentage).toFixed(1)}%`;
        return '0%';
      };

      const stats = [
        {
          title: 'Total Users',
          value: allUsers.filter((user) => user.role !== UserRole.SUPER_ADMIN)
            .length,
          icon: 'total-user',
          trend: calcTrend(
            allUsers.filter((user) => user.role !== UserRole.SUPER_ADMIN),
          ),
        },
        {
          title: 'Active Courses',
          value: allCourses.filter((course) => course.publish === true).length,
          icon: 'active-course',
          trend: calcTrend(
            allCourses.filter((course) => course.publish === true),
          ),
        },
        {
          title: 'Resources',
          value: allResources.length,
          icon: 'total-resources',
          trend: calcTrend(allResources),
        },
        {
          title: 'Certifications',
          value: allCertificates.length,
          icon: 'total-certifications',
          trend: calcTrend(allCertificates),
        },
      ];

      return { details, stats };
    } catch (error) {
      throw error;
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    try {
      await this.userRepository.update(id, updateUserDto);
      return { message: 'User updated successfully' };
    } catch (error) {
      throw error;
    }
  }

  async updateRole(id: string, role: UserRole) {
    const user = await this.findOne(id);
    user.role = role;

    await this.userRepository.save(user);
    return {
      message: 'Users role updated successfully!',
    };
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


  async completeChapter(userId: string, courseId: string, chapterId: string) {
    const course = await this.courseRepository.findOne({ 
      where: { id: courseId }, 
      relations: ["chapters"] 
    });
    if (!course) throw new NotFoundException("Course not found");

    const chapter = await this.chapterRepo.findOne({ where: { id: chapterId, course: { id: courseId } } });
    if (!chapter) throw new NotFoundException("Chapter not found in this course");

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException("User not found");

    // ✅ Save/update chapter progress
    let chapterProgress = await this.chapterProgressRepo.findOne({
      where: { user: { id: userId }, course: { id: courseId }, chapter: { id: chapterId } },
    });

    if (!chapterProgress) {
      chapterProgress = this.chapterProgressRepo.create({
        user, course, chapter, completed: true,
      });
    } else {
      chapterProgress.completed = true;
    }
    await this.chapterProgressRepo.save(chapterProgress);

    // ✅ Recalculate course progress
    const publishedChapters = course.chapters.filter(c => c.isPublished).length;
    const completedChapters = await this.chapterProgressRepo.count({
      where: { user: { id: userId }, course: { id: courseId }, completed: true },
    });

    const progress = publishedChapters > 0 ? (completedChapters / publishedChapters) * 100 : 0;

    let courseProgress = await this.courseProgressRepo.findOne({
      where: { user: { id: userId }, course: { id: courseId } },
    });

    if (!courseProgress) {
      courseProgress = this.courseProgressRepo.create({ user, course, progress, completed: progress === 100 });
    } else {
      courseProgress.progress = progress;
      courseProgress.completed = progress === 100;
    }

    await this.courseProgressRepo.save(courseProgress);

    // ✅ Issue certificate if course is complete
    if (courseProgress.completed) {
      let certificate = await this.certificateRepo.findOne({
        where: { user: { id: userId }, course: { id: courseId } },
      });

      if (!certificate) {
        certificate = this.certificateRepo.create({
          user,
          course,
          status: CertificateStatus.ISSUED,
          issuedAt: new Date(),
          serialNumber: `CERT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        });
        await this.certificateRepo.save(certificate);
      }
    }

    return courseProgress;
  }
}
