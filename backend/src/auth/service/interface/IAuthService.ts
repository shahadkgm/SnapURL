import type { RegisterDto } from '../../dto/register.dto.js';
import type { LoginDto } from '../../dto/login.dto.js';

export interface SafeUser {
  id: string;
  email: string;
  name: string | null;
  createdAt: Date;
}

export interface AuthResponse {
  user: SafeUser;
  token: string;
}

export interface IAuthService {
  register(dto: RegisterDto): Promise<AuthResponse>;
  login(dto: LoginDto): Promise<AuthResponse>;
  validateUserById(userId: string): Promise<SafeUser>;
}

export const AUTH_SERVICE_TOKEN = Symbol('IAuthService');
