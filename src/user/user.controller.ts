import { Controller, Get, Post, Body, Patch, Param, Delete, Request, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { OtpDto } from './dto/otp.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';
import { UserRole } from 'src/types/user';
import { RolesGuard } from 'src/auth/guards/role/roles.guard';
import { Roles } from 'src/core/decoratoros/roles.decorator';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Post('verify-otp')
  registrationOTP(@Body() otpDto: OtpDto) {
    return this.userService.verifyOTP(otpDto);
  }

  @Post('send-otp')
  async sendOTP(@Body('email') email: string) {
    await this.userService.registrationOTP(email);
    return {
      message: "OTP resent successfully",
      success: true,
    }
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Get("admin-stats")
  superStats(@Request() req) {
    return this.userService.superStats(req.user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.SUPER_ADMIN)
  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @Get("profile")
  getProfile(@Request() req) {
    return this.userService.getProfile(req.user.id);
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @Get("stats")
  getOtherInfo(@Request() req) {
    return this.userService.getOtherInfo(req.user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.SUPER_ADMIN)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Patch('role/:id')
  updateRole(@Param("id") id: string, @Body("role") role: UserRole) {
    return this.userService.updateRole(id, role);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Patch("/complete/chapter/:courseId/:chapterId")
  completeChapter(
    @Request() req,
    @Param("courseId") courseId: string,
    @Param("chapterId") chapterId: string,
  ) {
    return this.userService.completeChapter(req.user.id, courseId, chapterId);
  }

  // @UseAuthGuards(JwtAuthGuard)
  // @HttpCode(HttpStatus.OK)
  // @Get("/complete/chapter/:courseId/:chapterId")
  // getCompletedChapter
}
