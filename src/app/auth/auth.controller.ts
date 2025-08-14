import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './auth.dto';
import { JwtGuard } from './jwt.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() payload: RegisterDto) {
    return this.authService.register(payload);
  }

  @Post('login')
  async login(@Body() payload: any) {
    return this.authService.loginAdmin(payload);
  }

  @UseGuards(JwtGuard)
  @Get('profile')
  async profile() {
    return this.authService.profile();
  }
}
