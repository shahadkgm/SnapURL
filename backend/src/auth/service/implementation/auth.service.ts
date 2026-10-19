import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import bcrypt from 'bcrypt';
import { User, UserDocument } from '../../../database/schemas/user.schema.js';
import type { RegisterDto } from '../../dto/register.dto.js';
import type { LoginDto } from '../../dto/login.dto.js';
import type { AuthResponse, IAuthService, SafeUser } from '../interface/IAuthService.js';

@Injectable()
export class AuthService implements IAuthService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponse> {
    const normalizedEmail = dto.email.toLowerCase().trim();

    // 1. Check if user already exists
    const existingUser = await this.userModel.findOne({ email: normalizedEmail });

    if (existingUser) {
      throw new ConflictException('An account with this email already exists');
    }

    // 2. Hash password securely
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(dto.password, saltRounds);

    // 3. Create user in MongoDB
    const newUser = await this.userModel.create({
      email: normalizedEmail,
      password: hashedPassword,
      name: dto.name ? dto.name.trim() : null,
    });

    // 4. Generate JWT token
    const token = this.generateToken(newUser._id.toString(), newUser.email);

    return {
      user: {
        id: newUser._id.toString(),
        email: newUser.email,
        name: newUser.name,
        createdAt: (newUser as any).createdAt,
      },
      token,
    };
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const normalizedEmail = dto.email.toLowerCase().trim();

    // 1. Find user by email
    const user = await this.userModel.findOne({ email: normalizedEmail });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // 2. Verify password with bcrypt
    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // 3. Generate JWT token
    const token = this.generateToken(user._id.toString(), user.email);

    return {
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        createdAt: (user as any).createdAt,
      },
      token,
    };
  }

  async validateUserById(userId: string): Promise<SafeUser> {
    const user = await this.userModel
      .findById(userId)
      .select('email name createdAt')
      .lean();

    if (!user) {
      throw new UnauthorizedException('User no longer exists or session expired');
    }

    return {
      id: (user as any)._id.toString(),
      email: user.email,
      name: user.name ?? null,
      createdAt: (user as any).createdAt,
    };
  }

  private generateToken(userId: string, email: string): string {
    return this.jwtService.sign({
      sub: userId,
      email,
    });
  }
}
