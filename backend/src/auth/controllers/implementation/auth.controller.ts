import { Body, Controller, Get, HttpCode, HttpStatus, Inject, Post, UseGuards } from '@nestjs/common';
import { ROUTES } from '../../../common/constants/routes.constant.js';
import { RegisterDto } from '../../dto/register.dto.js';
import { LoginDto } from '../../dto/login.dto.js';
import { AUTH_SERVICE_TOKEN, type AuthResponse, type IAuthService, type SafeUser } from '../../service/interface/IAuthService.js';
import type { IAuthController } from '../interface/IAuthController.js';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard.js';
import { CurrentUser } from '../../decorators/current-user.decorator.js';

@Controller(ROUTES.AUTH.ROOT)
export class AuthController implements IAuthController {
  constructor(
    @Inject(AUTH_SERVICE_TOKEN)
    private readonly authService: IAuthService,
  ) {}

  @Post(ROUTES.AUTH.REGISTER)
  async register(@Body() dto: RegisterDto): Promise<AuthResponse> {
    return this.authService.register(dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post(ROUTES.AUTH.LOGIN)
  async login(@Body() dto: LoginDto): Promise<AuthResponse> {
    return this.authService.login(dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post(ROUTES.AUTH.LOGOUT)
  logout(): { message: string } {
    return { message: 'Logged out successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Get(ROUTES.AUTH.ME)
  getProfile(@CurrentUser() user: SafeUser): SafeUser {
    return user;
  }
}
