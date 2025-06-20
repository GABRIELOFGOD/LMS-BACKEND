import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { AuthJwtPayload } from 'src/types/auth.jwtPayload';
import { ResgistrationDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}
  
  async create(createAuthDto: ResgistrationDto) {
    return {
      message: `This action adds a new auth`
    };
  }

  async validateUser(email: string, password: string) {
    const user = await this.userService.findByEmail(email);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    if (user.isBlocked) throw new UnauthorizedException('User is blocked');
    if (user.isDeleted) throw new UnauthorizedException('User is deleted');
    if (!user.isVerified) throw new UnauthorizedException('User is not verified');

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) throw new UnauthorizedException('Invalid credentials');

    return { id: user.id }
  }

  login(userId: string) {
    const payload: AuthJwtPayload = { sub: userId };
    return this.jwtService.sign(payload);
  }
}
