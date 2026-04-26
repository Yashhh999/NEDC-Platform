import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // Strict rate limit: 5 registrations per minute per IP
  @Post('register')
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  // Strict rate limit: 10 login attempts per minute per IP
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { ttl: 60000, limit: 10 } })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
}
