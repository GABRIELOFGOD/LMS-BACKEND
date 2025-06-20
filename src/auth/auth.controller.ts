import {
  Controller,
  Post,
  UseGuards,
  HttpCode,
  HttpStatus,
  Request,
  Body,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth/local-auth.guard';
import { ResgistrationDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async signIn(@Request() req) {
    const token = this.authService.login(req.user.id);
    return {
      id: req.user.id,
      token,
    };
  }

  @Post('register')
  async create(@Body() registrationDto: ResgistrationDto) {
    return this.authService.create(registrationDto);
  }
}
