import type { RegisterDto } from '../../dto/register.dto.js';
import type { LoginDto } from '../../dto/login.dto.js';
import type { AuthResponse, SafeUser } from '../../service/interface/IAuthService.js';

export interface IAuthController {
  register(dto: RegisterDto): Promise<AuthResponse>;
  login(dto: LoginDto): Promise<AuthResponse>;
  logout(): { message: string };
  getProfile(user: SafeUser): SafeUser;
}
