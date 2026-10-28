import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AUTH_SERVICE_TOKEN, type IAuthService, type SafeUser } from '../service/interface/IAuthService.js';

export interface JwtPayload {
  sub: string;
  email: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    @Inject(AUTH_SERVICE_TOKEN)
    private readonly authService: IAuthService,
  ) {
    const rawSecret = configService.get<string>('JWT_SECRET');
    if (!rawSecret) {
      throw new Error('JWT_SECRET environment variable is missing');
    }
    const jwtSecret = String(rawSecret).replace(/^["']|["']$/g, '').trim();

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: JwtPayload): Promise<SafeUser> {
    const user = await this.authService.validateUserById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('Invalid or expired authentication token');
    }
    return user; // Attached to request.user
  }
}
