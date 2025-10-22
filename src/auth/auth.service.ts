// auth.service

import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { AuthJwtPayload } from 'src/types/auth.jwtPayload';
import { UserRole } from 'src/types/user';
import { EmailService } from 'src/email/email.service';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { ForgotPasswordDto } from 'src/user/dto/create-user.dto';
import { SetPasswordDto } from './dto/register.dto';
// import { ResgistrationDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
    
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}
  
  // async create(createAuthDto: ResgistrationDto) {
  //   return {
  //     message: `This action adds a new auth`
  //   };
  // }

  async validateUser(email: string, password: string) {
    const user = await this.userService.findByEmail(email);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    if (user.isBlocked) throw new UnauthorizedException('User is blocked');
    if (user.isDeleted) throw new UnauthorizedException('User is deleted');
    if (!user.isVerified) throw new UnauthorizedException('User is not verified');

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) throw new UnauthorizedException('Invalid credentials');

    return { id: user.id, role: user.role }
  }

  login(userId: string, role: UserRole) {
    const payload: AuthJwtPayload = { sub: userId, role };
    return this.jwtService.sign(payload);
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    try {
      const user = await this.userRepository.findOne({
        where: { email: forgotPasswordDto.email }
      });
      if (!user) throw new NotFoundException("User not found");
      
      const token = this.jwtService.sign(
        { email: user.email },
        { expiresIn: '10m' }
      );

      const link = `${process.env.CLIENT_URL}/new-password/${token}`;

      await this.emailService.forgotPassword(link, user.email);
      return {
        message: `Reset link send to ${user.email}` 
      }

    } catch (error) {
      throw error;
    }
  }

  async setPassword(setPasswordDto: SetPasswordDto, token: string){
    try {
      let email: string;
      try {
        const payload = this.jwtService.verify<{ email: string }>(token);
        email = payload.email;
      } catch (err) {
        if (err && (err as any).name === 'TokenExpiredError') {
          throw new UnauthorizedException('Password reset token has expired');
        }
        throw new UnauthorizedException('Invalid password reset token');
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(setPasswordDto.password, salt);

      const user = await this.userRepository.findOne({
        where: { email }
      });

      if (!user) throw new NotFoundException("User not found");
      if (user.isDeleted || user.isBlocked) throw new UnauthorizedException("This account is no longer active");

      user.password = hashedPassword;
      await this.userRepository.save(user);
      return { message: "User password changes successfully" };
    } catch (error) {
      throw error;
    }
  }
}
