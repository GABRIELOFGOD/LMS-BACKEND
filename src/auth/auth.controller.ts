import {
  Controller,
  Post,
  UseGuards,
  HttpCode,
  HttpStatus,
  Request,
  Body,
  // Body,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth/local-auth.guard';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { UserService } from 'src/user/user.service';
// import { ResgistrationDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async signIn(@Request() req) {
    const token = this.authService.login(req.user.id, req.user.role);
    return {
      id: req.user.id,
      role: req.user.role,
      token,
    };
  }

  @Post('register')
  async create(@Body() registrationDto: CreateUserDto) {
    return this.userService.create(registrationDto);
  }
}
